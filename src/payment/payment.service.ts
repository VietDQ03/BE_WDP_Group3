import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHmac } from 'crypto';
import { format } from 'date-fns';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import {
  PaymentOrder,
  VNPayConfig,
  VNPayResponse,
} from './interfaces/vnpay.interface';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import aqp from 'api-query-params';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly vnpayConfig: VNPayConfig;

  constructor(
    private configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.vnpayConfig = {
      tmnCode: this.configService.get<string>('VNPAY_TMN_CODE'),
      hashSecret: this.configService.get<string>('VNPAY_HASH_SECRET'),
      vnpUrl: this.configService.get<string>('VNPAY_URL'),
      returnUrl: this.configService.get<string>('VNPAY_RETURN_URL'),
    };
  }
  @Cron('*/1 * * * *')
  private async checkAndUpdateExpiredPayments() {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      // const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000); // 1 phút trước
      const result = await this.paymentModel.updateMany(
        {
          status: 'pending',
          createdAt: { $lt: fifteenMinutesAgo }
        },
        {
          $set: {
            status: 'failed',
            responseCode: '13', // Transaction timeout
            paymentTime: new Date() // Thêm thời gian cập nhật
          }
        }
      );
  
      if (result.modifiedCount > 0) {
        this.logger.log(`Updated ${result.modifiedCount} expired payments to failed status`);
      }
    } catch (error) {
      this.logger.error(`Error checking expired payments: ${error.message}`);
    }
  }

  private sortObject(obj: Record<string, any>): Record<string, any> {
    const sorted = {};
    const str = [];
    let key;

    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }

    str.sort();

    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }

    return sorted;
  }

  private validatePaymentData(payload: PaymentOrder): void {
    if (!payload.amount || payload.amount < 1000) {
      throw new Error('Amount must be at least 1000 VND');
    }

    if (!payload.orderInfo) {
      throw new Error('Order info is required');
    }

    if (!payload.orderType) {
      throw new Error('Order type is required');
    }

    payload.amount = Number(payload.amount);
    payload.orderInfo = String(payload.orderInfo).trim();
    payload.orderType = String(payload.orderType).trim();
  }

  private getResponseMessage(responseCode: string): string {
    const messages = {
      '00': 'Successful',
      '07': 'Suspicious transaction',
      '09': 'Invalid card',
      '10': 'Invalid amount',
      '11': 'Invalid order info',
      '12': 'Invalid request',
      '13': 'Transaction timeout',
      '24': 'Invalid customer',
      '51': 'Insufficient balance',
      '65': 'Transaction limit exceeded',
      '75': 'Wrong PIN',
      '79': 'Invalid OTP',
      '99': 'Other errors',
    };
    return messages[responseCode] || 'Unknown error';
  }

  private async createPaymentUrl(payload: PaymentOrder): Promise<string> {
    try {
      this.validatePaymentData(payload);

      const date = new Date();
      const createDate = format(date, 'yyyyMMddHHmmss');
      // Thay đổi từ DDHHmmss thành ddHHmmss
      const orderId = format(date, 'ddHHmmss');

      const vnpParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.vnpayConfig.tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `${payload.orderInfo}:${orderId}`,
        vnp_OrderType: 'other',
        vnp_Amount: String(payload.amount * 100),
        vnp_ReturnUrl: this.vnpayConfig.returnUrl,
        vnp_IpAddr: '127.0.0.1',
        vnp_CreateDate: createDate,
      };

      if (payload.bankCode) {
        vnpParams['vnp_BankCode'] = payload.bankCode;
      }

      const sortedParams = this.sortObject(vnpParams);

      const signData = Object.entries(sortedParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      const hmac = createHmac('sha512', this.vnpayConfig.hashSecret);
      const encoder = new TextEncoder();
      const secured = hmac.update(encoder.encode(signData)).digest('hex');

      const finalParams = {
        ...vnpParams,
        vnp_SecureHash: secured,
      };

      const queryString = Object.entries(finalParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      const paymentUrl = `${this.vnpayConfig.vnpUrl}?${queryString}`;

      this.logger.debug('Payment creation details:', {
        params: vnpParams,
        sortedParams,
        signData,
        secureHash: secured,
        paymentUrl,
      });

      await this.createPaymentRecord({
        orderId,
        amount: payload.amount,
        orderInfo: vnpParams.vnp_OrderInfo,
        status: 'pending',
        userId: new Types.ObjectId(payload.userId),
      });

      return paymentUrl;
    } catch (error) {
      this.logger.error(`Error creating payment URL: ${error.message}`);
      throw error;
    }
  }

  private async createPaymentRecord(
    paymentData: Partial<Payment>,
  ): Promise<Payment> {
    try {
      const payment = new this.paymentModel(paymentData);
      return await payment.save();
    } catch (error) {
      this.logger.error(`Error saving payment record: ${error.message}`);
      throw error;
    }
  }

  async createPayment(paymentOrder: PaymentOrder) {
    try {
      await this.checkAndUpdateExpiredPayments();
      if (!this.vnpayConfig.tmnCode || !this.vnpayConfig.hashSecret) {
        throw new Error('Invalid VNPay configuration');
      }

      const paymentUrl = await this.createPaymentUrl(paymentOrder);

      return {
        status: 'success',
        data: {
          paymentUrl,
        },
      };
    } catch (error) {
      this.logger.error(`Error in createPayment: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
  async handlePaymentReturn(vnpayResponse: VNPayResponse) {
    try {
      await this.checkAndUpdateExpiredPayments();
      const secureHash = vnpayResponse.vnp_SecureHash;

      const responseParams = { ...vnpayResponse };
      delete responseParams.vnp_SecureHash;
      delete responseParams.vnp_SecureHashType;

      const sortedParams = this.sortObject(responseParams);

      const signData = Object.entries(sortedParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      const hmac = createHmac('sha512', this.vnpayConfig.hashSecret);
      const checkSum = hmac.update(signData, 'utf-8').digest('hex');

      this.logger.debug('Payment return details:', {
        originalResponse: vnpayResponse,
        responseParams,
        signData,
        checkSum,
        secureHash,
      });

      if (secureHash !== checkSum) {
        return {
          status: 'error',
          message: 'Invalid signature',
        };
      }

      const orderId = vnpayResponse.vnp_TxnRef;
      const responseCode = vnpayResponse.vnp_ResponseCode;
      const existingPayment = await this.paymentModel.findOne({ orderId });
      await this.paymentModel.findOneAndUpdate(
        { orderId },
        {
          status: responseCode === '00' ? 'success' : 'failed',
          bankCode: vnpayResponse.vnp_BankCode,
          bankTranNo: vnpayResponse.vnp_BankTranNo,
          transactionNo: vnpayResponse.vnp_TransactionNo,
          responseCode,
          paymentTime: new Date(),
        },
        { new: true },
      );
      if (responseCode === '00' && existingPayment?.userId) {
        let premiumToAdd = 0;
  
        // Determine premium level to add based on amount
        const amount = existingPayment.amount;
        if (amount === 99000) {
          premiumToAdd = 3;
        } else if (amount === 159000) {
          premiumToAdd = 5;
        } else if (amount === 299000) {
          premiumToAdd = 10;
        }
  
        if (premiumToAdd > 0) {
          // Get current user and their premium level
          const user = await this.userModel.findById(existingPayment.userId);
          const currentPremium = user?.premium || 0;
          
          // Update premium by adding new premium to existing premium
          await this.userModel.findByIdAndUpdate(
            existingPayment.userId,
            {
              premium: currentPremium + premiumToAdd,
            },
            { new: true },
          );
        }
      }
      return {
        status: 'success',
        data: {
          orderId,
          responseCode,
          message: this.getResponseMessage(responseCode),
        },
      };
    } catch (error) {
      this.logger.error(`Error handling payment return: ${error.message}`);
      throw error;
    }
  }

  async getPaymentStatus(orderId: string) {
    try {
      await this.checkAndUpdateExpiredPayments();

      const payment = await this.paymentModel.findOne({ orderId });
      if (!payment) {
        return {
          status: 'error',
          message: 'Payment not found',
        };
      }

      return {
        status: 'success',
        data: payment,
      };
    } catch (error) {
      this.logger.error(`Error getting payment status: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  async getPaymentStatistics() {
    try {
      const stats = await this.paymentModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
      ]);

      return {
        status: 'success',
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Error getting payment statistics: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  async cancelPayment(orderId: string) {
    try {
      const payment = await this.paymentModel.findOneAndUpdate(
        { orderId, status: 'pending' },
        { status: 'cancelled' },
        { new: true },
      );

      if (!payment) {
        return {
          status: 'error',
          message: 'Payment not found or cannot be cancelled',
        };
      }

      return {
        status: 'success',
        data: payment,
      };
    } catch (error) {
      this.logger.error(`Error cancelling payment: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
  async findAll(currentPage: number, limit: number, qs: string) {
    try {
      const { filter, sort, population, projection } = aqp(qs);
      delete filter.current;
      delete filter.pageSize;

      const searchConditions: any[] = [];

      // Add search conditions if needed
      if (filter.orderId) {
        searchConditions.push({
          orderId: { $regex: filter.orderId, $options: 'i' },
        });
        delete filter.orderId;
      }

      if (filter.status) {
        searchConditions.push({
          status: { $regex: filter.status, $options: 'i' },
        });
        delete filter.status;
      }

      if (filter.amount) {
        searchConditions.push({
          amount: filter.amount,
        });
        delete filter.amount;
      }

      if (filter.month && filter.year) {
        const month = filter.month.toString().padStart(2, '0');
        const year = filter.year;
        const lastDayOfMonth = new Date(+year, +filter.month, 0).getDate();
      
        searchConditions.push({
          paymentTime: {
            $gte: new Date(`${year}-${month}-01`),
            $lte: new Date(`${year}-${month}-${lastDayOfMonth}`),
          },
        });
        delete filter.month;
        delete filter.year;
      }
      else if (filter.year) {
        searchConditions.push({
          paymentTime: {
            $gte: new Date(`${filter.year}-01-01`),
            $lte: new Date(`${filter.year}-12-31`),
          },
        });
        delete filter.year;
      }

      if (filter.orderInfo) {
        searchConditions.push({
          orderInfo: { $regex: filter.orderInfo, $options: 'i' },
        });
        delete filter.orderInfo;
      }

      let finalFilter: any = { ...filter };

      if (searchConditions.length > 0) {
        finalFilter = {
          ...filter,
          $and: searchConditions,
        };
      }

      const offset = (+currentPage - 1) * +limit;
      const defaultLimit = +limit ? +limit : 10;

      const totalItems = await this.paymentModel.countDocuments(finalFilter);
      const totalPages = Math.ceil(totalItems / defaultLimit);

      // Thêm sort theo paymentTime giảm dần (-1)
      const defaultSort = { paymentTime: -1, ...sort };

      const result = await this.paymentModel
        .find(finalFilter)
        .skip(offset)
        .limit(defaultLimit)
        .sort(defaultSort as any)
        .populate(population)
        .select(projection as any)
        .exec();

      return {
        meta: {
          current: currentPage,
          pageSize: limit,
          pages: totalPages,
          total: totalItems,
        },
        result,
      };
    } catch (error) {
      this.logger.error(`Error in findAll: ${error.message}`);
      throw error;
    }
  }

  async findByUserId(
    userId: string,
    currentPage: number,
    limit: number,
    qs: string,
  ) {
    try {
      const { filter, sort, population, projection } = aqp(qs);
      delete filter.current;
      delete filter.pageSize;

      const searchConditions: any[] = [{ userId: new Types.ObjectId(userId) }];

      if (filter.orderId) {
        searchConditions.push({
          orderId: { $regex: filter.orderId, $options: 'i' },
        });
        delete filter.orderId;
      }

      if (filter.status) {
        searchConditions.push({
          status: { $regex: filter.status, $options: 'i' },
        });
        delete filter.status;
      }

      if (filter.amount) {
        searchConditions.push({
          amount: filter.amount,
        });
        delete filter.amount;
      }

      if (filter.orderInfo) {
        searchConditions.push({
          orderInfo: { $regex: filter.orderInfo, $options: 'i' },
        });
        delete filter.orderInfo;
      }

      // Tìm kiếm theo năm
      if (filter.month && filter.year) {
        const month = filter.month.toString().padStart(2, '0');
        const year = filter.year;
        const lastDayOfMonth = new Date(+year, +filter.month, 0).getDate();
      
        searchConditions.push({
          paymentTime: {
            $gte: new Date(`${year}-${month}-01`),
            $lte: new Date(`${year}-${month}-${lastDayOfMonth}`),
          },
        });
        delete filter.month;
        delete filter.year;
      }
      // Sau đó mới tìm kiếm theo năm
      else if (filter.year) {
        searchConditions.push({
          paymentTime: {
            $gte: new Date(`${filter.year}-01-01`),
            $lte: new Date(`${filter.year}-12-31`),
          },
        });
        delete filter.year;
      }

      const finalFilter = {
        ...filter,
        $and: searchConditions,
      };

      const offset = (+currentPage - 1) * +limit;
      const defaultLimit = +limit ? +limit : 10;

      const totalItems = await this.paymentModel.countDocuments(finalFilter);
      const totalPages = Math.ceil(totalItems / defaultLimit);

      const result = await this.paymentModel
        .find(finalFilter)
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort as any)
        .populate(population)
        .select(projection as any)
        .exec();

      return {
        meta: {
          current: currentPage,
          pageSize: limit,
          pages: totalPages,
          total: totalItems,
        },
        result,
      };
    } catch (error) {
      this.logger.error(`Error in findByUserId: ${error.message}`);
      throw error;
    }
  }
}

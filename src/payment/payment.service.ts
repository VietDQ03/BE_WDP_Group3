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
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly vnpayConfig: VNPayConfig;

  constructor(
    private configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {
    this.vnpayConfig = {
      tmnCode: this.configService.get<string>('VNPAY_TMN_CODE'),
      hashSecret: this.configService.get<string>('VNPAY_HASH_SECRET'),
      vnpUrl: this.configService.get<string>('VNPAY_URL'),
      returnUrl: this.configService.get<string>('VNPAY_RETURN_URL'),
    };
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
        vnp_OrderInfo: `Thanh toan cho ma GD:${orderId}`,
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
        // userId: new Types.ObjectId(userId),
        // payerId: new Types.ObjectId(userId),
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
}

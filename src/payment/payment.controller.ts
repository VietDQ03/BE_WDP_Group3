import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Logger,
  Res,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Public } from 'src/decorator/customize';
import { VNPayResponse } from './interfaces/vnpay.interface';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Public()
  @Post('create')
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    // userId: string,
  ) {
    try {
      this.logger.log(
        `Creating payment with data: ${JSON.stringify(createPaymentDto)}`,
      );
      return await this.paymentService.createPayment(createPaymentDto);
      // return await this.paymentService.createPayment(createPaymentDto, userId);

    } catch (error) {
      this.logger.error(`Error creating payment: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Public()
  @Get('success')
  paymentSuccess() {
    return {
      status: 'success',
      message: 'Payment completed successfully',
    };
  }

  @Public()
  @Get('failed')
  paymentFailed() {
    return {
      status: 'error',
      message: 'Payment failed',
    };
  }

  @Public()
  @Get('vnpay-return')
  async vnpayReturn(@Query() query: VNPayResponse, @Res() response: Response) {
    try {
      this.logger.log(
        `Received VNPay return with data: ${JSON.stringify(query)}`,
      );

      // Kiểm tra xem có nhận đủ các tham số cần thiết không
      if (!query.vnp_ResponseCode || !query.vnp_TxnRef) {
        this.logger.error('Missing required parameters from VNPay');
        return response.json({
          status: 'error',
          message: 'Missing required parameters',
        });
      }

      const result = await this.paymentService.handlePaymentReturn(query);
      this.logger.log(`Payment result: ${JSON.stringify(result)}`);

      // Nếu thanh toán thành công
      if (
        query.vnp_ResponseCode === '00' &&
        query.vnp_TransactionStatus === '00'
      ) {
        return response.json({
          status: 'success',
          message: 'Payment successful',
          data: result,
        });
      } else {
        return response.json({
          status: 'error',
          message: `Payment failed with code: ${query.vnp_ResponseCode}`,
          data: result,
        });
      }
    } catch (error) {
      this.logger.error(`Error handling VNPay return: ${error.message}`);
      return response.json({
        status: 'error',
        message: error.message,
      });
    }
  }

  @Public()
  @Get('status/:orderId') // Chú ý cách định nghĩa param
  async getPaymentStatus(@Param('orderId') orderId: string) {
    // Dùng @Param thay vì @Query
    try {
      const result = await this.paymentService.getPaymentStatus(orderId);
      return {
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      return {
        statusCode: 200,
        data: {
          status: 'error',
          message: error.message,
        },
      };
    }
  }

  // Các trang kết quả thanh toán
  // @Public()
  // @Get('success')
  // paymentSuccess() {
  //   return {
  //     status: 'success',
  //     message: 'Payment completed successfully'
  //   };
  // }

  // @Public()
  // @Get('failed')
  // paymentFailed() {
  //   return {
  //     status: 'error',
  //     message: 'Payment failed'
  //   };
  // }
}

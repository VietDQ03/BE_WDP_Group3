import { Controller, Post, Body, Get, Query, Logger, Res } from '@nestjs/common';
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
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      this.logger.log(`Creating payment with data: ${JSON.stringify(createPaymentDto)}`);
      return await this.paymentService.createPayment(createPaymentDto);
    } catch (error) {
      this.logger.error(`Error creating payment: ${error.message}`);
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  @Public()
  @Get('vnpay-return')
  async vnpayReturn(
    @Query() query: VNPayResponse,
    @Res() response: Response
  ) {
    try {
      this.logger.log(`Received VNPay return with data: ${JSON.stringify(query)}`);
      const result = await this.paymentService.handlePaymentReturn(query);

      // Nếu thanh toán thành công
      if (result.status === 'success' && result.data?.responseCode === '00') {
        // Redirect tới trang thành công
        return response.redirect('/payment/success');
      } else {
        // Redirect tới trang thất bại
        return response.redirect('/payment/failed');
      }
    } catch (error) {
      this.logger.error(`Error handling VNPay return: ${error.message}`);
      return response.redirect('/payment/failed');
    }
  }

  @Public()
  @Get('status/:orderId')
  async getPaymentStatus(@Query('orderId') orderId: string) {
    try {
      return await this.paymentService.getPaymentStatus(orderId);
    } catch (error) {
      this.logger.error(`Error getting payment status: ${error.message}`);
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  // Các trang kết quả thanh toán
  @Public()
  @Get('success')
  paymentSuccess() {
    return {
      status: 'success',
      message: 'Payment completed successfully'
    };
  }

  @Public()
  @Get('failed')
  paymentFailed() {
    return {
      status: 'error',
      message: 'Payment failed'
    };
  }
}
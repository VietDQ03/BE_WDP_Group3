import { Body, Controller, Get, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessages, UserS } from 'src/decorator/customize';
import { Cron } from '@nestjs/schedule';
import { SendOtpDto, SendResultDto } from './dto/send-Mail.dto';
import { IUser } from 'src/users/users.interface';


@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) { }

  @Get('SendJob')
  @Public()
  @ResponseMessages("Test email")
  @Cron("0 10 0 * * 0")
  async sendJobMail() {
    this.mailService.HandleJobMail()
  }

  @Post('sendOTP')
  @Public()
  @ResponseMessages("Send OTP")
  async sendOTP(@Body() sendOtp: SendOtpDto) {
    return this.mailService.sendOtp(sendOtp.email)
  }

  @Post('sendResult')
  @Public()
  @ResponseMessages("Send OTP")
  async sendResultResumeMail(@Body() sendResultDto: SendResultDto) {
    return this.mailService.sendResultResumeMail(sendResultDto)
  }



}


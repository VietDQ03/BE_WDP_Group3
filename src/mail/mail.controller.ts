import { Body, Controller, Get, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessages, UserS } from 'src/decorator/customize';
import { Cron } from '@nestjs/schedule';
import { SendInvitationDto, SendOtpDto, SendResultDto } from './dto/send-Mail.dto';
import { IUser } from 'src/users/users.interface';
import { send } from 'process';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mail')
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
  @ResponseMessages("Send Result")
  async sendResultResumeMail(@Body() sendResultDto: SendResultDto) {
    return this.mailService.sendResultResumeMail(sendResultDto)
  }

  //test send mail to hr
  // @Public()
  // @Post('sendHR')
  // @ResponseMessages("Send HR")
  // async sendHR() {
  //   return this.mailService.sendMailToHR('67a22a3c5fcb51fc22654d71', 'FPT')
  // }

  //test send mail Invitation to user
  @Public()
  @Post('sendInvitation')
  @ResponseMessages("Send Invitation success")
  async sendInvitation(@Body() sendInvitationDto: SendInvitationDto) {
    return this.mailService.sendInvitation(sendInvitationDto.userId, sendInvitationDto.jobId)



  }
}

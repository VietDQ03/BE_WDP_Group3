import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { CreateVerificationDto, ValidateOtpDto } from './dto/create-verification.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';
import { Public } from 'src/decorator/customize';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) { }

  @Public()
  @Post()
  createOtp(@Body() createVerificationDto: CreateVerificationDto) {
    return this.verificationService.generateOtp(createVerificationDto);
  }

  // @Public()
  // @Post('validate-otp')
  // async validateOtp(@Body() validateOtpDto: ValidateOtpDto) {
  //   const isValid = await this.verificationService.validateOtp(validateOtpDto.email, validateOtpDto.otp);
  //   if (isValid) {
  //     return { message: 'OTP is valid' };
  //   } else {
  //     return { message: 'OTP is invalid or expired' };
  //   }
  // }

  // @Get()
  // findAll() {
  //   return this.verificationService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.verificationService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateVerificationDto: UpdateVerificationDto) {
  //   return this.verificationService.update(+id, updateVerificationDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.verificationService.remove(+id);
  // }
}

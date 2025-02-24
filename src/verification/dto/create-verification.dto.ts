import { Prop } from '@nestjs/mongoose';
import {
    IsEmail,
    IsMongoId,
    IsNotEmpty,
    IsNotEmptyObject,
    IsObject,
    IsString,
    ValidateNested,
  } from 'class-validator';

export class CreateVerificationDto {
  @IsEmail({}, { message: 'Email không đúng định dạng', })
  @IsNotEmpty({ message: 'Email không được để trống', })
  email: string = 'quannt552003@gmail.com';
}

export class ValidateOtpDto {
  @IsEmail({}, { message: 'Email không đúng định dạng', })
  @IsNotEmpty({ message: 'Email không được để trống', })
  email: string = "quannt552003@gmail.com";
  @IsString()
  otp: string = "222401";
}
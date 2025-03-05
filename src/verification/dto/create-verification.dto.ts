import {
    IsEmail,
    IsNotEmpty,
    IsString,
  } from 'class-validator';

export class CreateVerificationDto {
  @IsEmail({}, { message: 'Email không đúng định dạng', })
  @IsNotEmpty({ message: 'Email không được để trống', })
  email: string ;
}

export class ValidateOtpDto {
  @IsEmail({}, { message: 'Email không đúng định dạng', })
  @IsNotEmpty({ message: 'Email không được để trống', })
  email: string;
  @IsString()
  otp: string;
}
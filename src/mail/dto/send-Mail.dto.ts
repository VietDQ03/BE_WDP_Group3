import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';


export class SendOtpDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;
}


export class SendResultDto {
  @IsNotEmpty({ message: 'UserId không được để trống' })
  userId: string;

  @IsNotEmpty({ message: 'ResumeId không được để trống' })
  resumeId: string;

  @IsNotEmpty({ message: 'Status không được để trống' })
  status: string;
}

export class SendInvitationDto {
  @IsNotEmpty({ message: 'UserId không được để trống' })
  userId: string;

  @IsNotEmpty({ message: 'JobId không được để trống' })
  jobId: string;
}

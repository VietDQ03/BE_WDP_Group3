import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import mongoose from 'mongoose';

export class UploadFileDto {
  @IsString()
  @ApiProperty({
    example: 'CV Dang Quoc Viet-1719311285874.pdf',
    description: 'fileName',
  })
  url: string;
}

export class CreateCvDto {
  @IsString()
  @ApiProperty({
    example: 'CV Dang Quoc Viet-1719311285874.pdf',
    description: 'fileName',
  })
  url: string;

//   @IsNotEmpty()
//   @IsMongoId()
//   user_id: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @IsMongoId({ each: true, message: 'position là mongo object id' })
  @IsArray()
  position?: mongoose.Schema.Types.ObjectId[];

  @IsOptional()
  @IsString({ each: true, message: 'description là string' })
  description?: string;

  @IsOptional()
  @IsMongoId({ each: true, message: 'Skill là mongo object id' })
  @IsArray()
  skill?: mongoose.Schema.Types.ObjectId[];

  @IsOptional()
  @IsMongoId({ each: true, message: 'Experience là mongo object id' })
  @ApiProperty({
    example: '67a8858cc0193925e3827817',
    description: 'experience',
  })
  experience?: mongoose.Schema.Types.ObjectId;

  @IsBoolean({ each: true, message: 'isActive là boolean' })
  @ApiProperty({ example: 'false', description: 'isActive' })
  isActive: boolean;
}

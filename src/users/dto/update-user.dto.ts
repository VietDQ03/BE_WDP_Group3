import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { Type } from 'class-transformer';
class Company {
  @IsOptional()
  _id: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  name: string;
}
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'email'] as const),
) {
  @IsOptional({ message: 'Role không được để trống' })
  @IsMongoId({ message: 'Role có định dạng là mongo id' })
  role: mongoose.Schema.Types.ObjectId;
  @IsOptional()
  @ValidateNested()
  @IsObject()
  @Type(() => Company)
  company: Company;
}

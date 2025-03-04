import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'email'] as const),
) {
  @IsNotEmpty({ message: 'Role không được để trống' })
  @IsMongoId({ message: 'Role có định dạng là mongo id' })
  role: mongoose.Schema.Types.ObjectId;
}

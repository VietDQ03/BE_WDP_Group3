import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

//data transfer object // class = { }

class Company {
  @IsOptional()
  _id: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  name: string;
}

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  @Matches(
    /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{1,}$/,
    {
      message: 'Password phải chứa ít nhất 1 chữ viết hoa và 1 ký tự đặc biệt',
    },
  )
  password: string;
  @IsOptional()
  @Min(0, { message: 'Tuổi không được là số âm' })
  age: number;

  @IsOptional()
  gender: string;

  @IsOptional()
  address: string;
  @IsOptional()
  avatarUrl: string;

  @IsOptional()
  isActived: boolean;

  @IsOptional()
  @Min(0, { message: 'Premium không được là số âm' })
  premium: number;

  // @IsNotEmpty({ message: 'Role không được để trống' })
  // @IsMongoId({ message: 'Role có định dạng là mongo id' })
  // role: mongoose.Schema.Types.ObjectId;

  // @IsOptional()
  // @ValidateNested()
  // @IsObject()
  // @Type(() => Company)
  // company: Company;

  // @IsOptional()
  // @IsMongoId({ message: 'Company có định dạng là mongo id' })
  // company?: mongoose.Schema.Types.ObjectId;
}

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'Age không được để trống' })
  age: number;

  @IsNotEmpty({ message: 'Gender không được để trống' })
  gender: string;

  @IsNotEmpty({ message: 'Address không được để trống' })
  address: string;

  // @IsMongoId({ message: 'Role có định dạng là mongo id' })
  // role: mongoose.Schema.Types.ObjectId;

  // @IsOptional()
  // @IsMongoId({ message: 'Company có định dạng là mongo id' })
  // company?: mongoose.Schema.Types.ObjectId;

  // @IsBoolean()
  // isActived: boolean = false;
}
export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'quocviet27403@gmail.com', description: 'username' })
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123456',
    description: 'password',
  })
  readonly password: string;
}

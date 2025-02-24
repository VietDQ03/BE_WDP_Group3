import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  address: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty({ message: 'Logo không được để trống', })
  logo: string;
  @IsOptional()
  isActive: boolean

}

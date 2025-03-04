import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1000)
  amount: number;

  @IsString()
  @IsNotEmpty()
  orderType: string;

  @IsString()
  @IsNotEmpty()
  orderInfo: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  bankCode?: string;
}
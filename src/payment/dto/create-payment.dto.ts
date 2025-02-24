import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1000)
  amount: number;

  @IsNotEmpty()
  @IsString()
  orderInfo: string;

  @IsNotEmpty()
  @IsString()
  orderType: string;

  @IsString()
  bankCode?: string;

  @IsString()
  language?: string;
}
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, IsMongoId } from 'class-validator';

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
  // @IsMongoId() // Validate MongoDB ObjectId format
  // @IsOptional() // Optional vì sẽ được lấy từ request.user
  // userId?: string;

  // @IsMongoId()
  // @IsOptional()
  // payerId?: string; // Thêm nếu bạn muốn cho phép specify người thanh toán khác
}
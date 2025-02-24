// payment/schemas/payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment> ;
@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  orderInfo: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  paymentTime: Date;

  @Prop()
  bankCode: string;

  @Prop()
  bankTranNo: string;

  @Prop()
  transactionNo: string;

  @Prop()
  responseCode: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
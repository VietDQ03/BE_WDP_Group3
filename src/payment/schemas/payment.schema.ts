import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

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
  bankCode?: string;

  @Prop()
  bankTranNo?: string;

  @Prop()
  transactionNo?: string;

  @Prop()
  responseCode?: string;

  @Prop()
  paymentTime?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
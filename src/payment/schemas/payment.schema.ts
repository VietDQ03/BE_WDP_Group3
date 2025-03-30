import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  orderInfo: string;

  @Prop({ 
    required: true, 
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  })
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
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // Thêm reference tới User
  userId: Types.ObjectId;

  // @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // Người thanh toán
  // payerId: Types.ObjectId;
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
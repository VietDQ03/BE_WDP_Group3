import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type positionDocument = HydratedDocument<position>;

@Schema({ timestamps: true })
export class position {
    @Prop()
    name: string;
    @Prop()
    category_id: mongoose.Schema.Types.ObjectId;
}

export const positionSchema = SchemaFactory.createForClass(position);
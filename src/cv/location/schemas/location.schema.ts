import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type LocationDocument = HydratedDocument<Location>;

@Schema({ timestamps: true })
export class Location {
    @Prop()
    name: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
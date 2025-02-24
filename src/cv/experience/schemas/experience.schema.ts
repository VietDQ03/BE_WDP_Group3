import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { isString } from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';

export type ExperienceDocument = HydratedDocument<Experience>;

@Schema({ timestamps: true })
export class Experience {
    @Prop()
    name: string;
}

export const ExperienceSchema = SchemaFactory.createForClass(Experience);

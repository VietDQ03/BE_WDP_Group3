import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CvDocument = HydratedDocument<Cv>;

@Schema({ timestamps: true })
export class Cv {
    @Prop()
    user_id: mongoose.Schema.Types.ObjectId
    @Prop()
    url: string;
    @Prop()
    position: mongoose.Schema.Types.ObjectId[];

    @Prop()
    specialPosition: string[];

    @Prop()
    skill: mongoose.Schema.Types.ObjectId;

    @Prop()
    experience: mongoose.Schema.Types.ObjectId;

    @Prop()
    salary: number;

    @Prop()
    location: mongoose.Schema.Types.ObjectId;

    @Prop()
    isJobChangeable: boolean

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;
}

export const CvSchema = SchemaFactory.createForClass(Cv);

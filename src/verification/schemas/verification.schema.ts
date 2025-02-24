import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type VerificationDocument = HydratedDocument<Verification>;

@Schema({ timestamps: true })
export class Verification {
    @Prop()
    email: string;

    @Prop()
    token: string;

    @Prop()
    expiresAt: Date;

    @Prop()
    createdAt: Date;
}

export const VerificationSchema = SchemaFactory.createForClass(Verification)
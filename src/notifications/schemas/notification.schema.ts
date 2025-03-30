import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userId: mongoose.Schema.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job' })
    jobId: mongoose.Schema.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company' })
    companyId: mongoose.Schema.Types.ObjectId;
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }] })
    skillId: mongoose.Schema.Types.ObjectId[];
    @Prop()
    createdAt: Date;
    @Prop()
    updatedAt: Date;
    @Prop({ default: false })
    isSeen: boolean;

}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

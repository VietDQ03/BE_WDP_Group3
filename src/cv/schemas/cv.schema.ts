import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Skill } from '../skills/schemas/skill.schema';
import { Position } from '../positions/schemas/position.schema';
import { Experience } from '../experience/schemas/experience.schema';
import { User } from 'src/users/schemas/user.schema';

export type CvDocument = HydratedDocument<Cv>;

@Schema({ timestamps: true })
export class Cv {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    user_id: mongoose.Schema.Types.ObjectId
    @Prop()
    url: string;
    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Position.name })
    position: mongoose.Schema.Types.ObjectId[];

    @Prop()
    description: string;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Skill.name })
    skill: mongoose.Schema.Types.ObjectId[];

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Experience.name })
    experience: mongoose.Schema.Types.ObjectId;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
    @Prop()
    isActive: boolean;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;
}

export const CvSchema = SchemaFactory.createForClass(Cv);

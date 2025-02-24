import { IsMongoId, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreatePositionDto {
    @IsString()
    name: string;

    @IsMongoId({ message: "category_id phải là mongo object id" })
    category_id: mongoose.Schema.Types.ObjectId | null;
}

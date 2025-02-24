import { IsMongoId, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreateCategoryDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsMongoId({ message: "parent_id phải là mongo object id" })
    parent_id: mongoose.Schema.Types.ObjectId | null;
}

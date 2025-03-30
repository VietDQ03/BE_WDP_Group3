import { IsMongoId, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreatePositionDto {
    @IsString()
    name: string;
}

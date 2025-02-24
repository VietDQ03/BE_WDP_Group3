import { Prop } from "@nestjs/mongoose";
import { IsString } from "class-validator";

export class CreateExperienceDto {
    @IsString()
    name: string;
}

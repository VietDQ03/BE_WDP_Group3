import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCvDto } from './create-cv.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';
export class UpdateCvDto extends PartialType(
    OmitType(CreateCvDto, ['url',] as const)
) {
    @IsNotEmpty()
    @IsMongoId({ each: true, message: "Id là mongo object id" })
    _id: mongoose.Schema.Types.ObjectId;
}
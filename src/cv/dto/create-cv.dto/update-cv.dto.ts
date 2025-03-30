import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCvDto } from './create-cv.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';
export class UpdateCvDto extends PartialType(CreateCvDto) { }

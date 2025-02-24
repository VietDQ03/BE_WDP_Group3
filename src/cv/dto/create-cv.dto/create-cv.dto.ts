import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId, IsBoolean, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class UploadFileDto {
    @IsString()
    @ApiProperty({ example: 'CV Dang Quoc Viet-1719311285874.pdf', description: 'fileName' })
    url: string;
}

export class CreateCvDto {

    @IsString()
    @ApiProperty({ example: 'CV Dang Quoc Viet-1719311285874.pdf', description: 'fileName' })
    url: string;

    @IsOptional()
    @IsMongoId({ each: true, message: "position là mongo object id" })
    @ApiProperty({ example: '67a8d85cc62145146ed844d7', description: 'position' })
    position?: mongoose.Schema.Types.ObjectId[];

    @IsOptional()
    @IsString({ each: true, message: "specialPosition là string" })
    specialPosition?: string[];

    @IsOptional()
    @IsMongoId({ each: true, message: "Skill là mongo object id" })
    @ApiProperty({ example: '67a8cea71a85af71f3bad48c', description: 'skill' })
    skill?: mongoose.Schema.Types.ObjectId[];

    @IsOptional()
    @IsMongoId({ each: true, message: "Experience là mongo object id" })
    @ApiProperty({ example: '67a8858cc0193925e3827817', description: 'experience' })
    experience?: mongoose.Schema.Types.ObjectId;

    @IsOptional()
    @ApiProperty({ example: 5000, description: 'salary' })
    salary?: number;

    @IsOptional()
    @IsMongoId({ each: true, message: "Location là mongo object id" })
    @ApiProperty({ example: '67a8a221a5b1c50de56bff11', description: 'location' })
    location?: mongoose.Schema.Types.ObjectId[];

    @IsOptional()
    @IsBoolean({ message: 'isJobChangeable có giá trị boolean' })
    @ApiProperty({ example: true, description: 'isJobChangeable' })
    isJobChangeable?: boolean;
}
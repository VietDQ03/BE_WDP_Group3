import { IsMongoId, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ObjectId, Types } from "mongoose";

export class CreateNotificationDto {
    @IsNotEmpty({ message: 'UserId không được để trống' })
    @IsMongoId({ message: 'UserId có định dạng là mongo id' })
    userId: Types.ObjectId;
    @IsNotEmpty({ message: 'jobId không được để trống' })
    @IsMongoId({ message: 'jobId có định dạng là mongo id' })
    jobId: Types.ObjectId;
    @IsNotEmpty({ message: 'companyId không được để trống' })
    @IsMongoId({ message: 'companyId có định dạng là mongo id' })
    companyId: Types.ObjectId;
    @IsNotEmpty({ message: 'skillId không được để trống' })
    @IsMongoId({ each: true, message: 'skillId có định dạng là mongo id' })
    skillId: Types.ObjectId[];
}

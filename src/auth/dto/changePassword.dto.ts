import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    // @MinLength(6)
    oldPassword: string;

    @IsString()
    @MinLength(6)
    newPassword: string;

}

export class ForgetPasswordDto {

    @IsString()
    email: string;

    @IsString()
    @MinLength(6)
    newPassword: string;

    @IsString()
    @MinLength(6)
    otp: string;
}
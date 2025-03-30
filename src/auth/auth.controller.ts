import {
  Controller,
  Post,
  UseGuards,
  Req,
  Body,
  Res,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessages, UserS } from 'src/decorator/customize';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { RegisterUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { RolesService } from 'src/roles/roles.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ValidateOtpDto } from 'src/verification/dto/create-verification.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { ChangePasswordDto, ForgetPasswordDto } from './dto/changePassword.dto';
import { UsersService } from 'src/users/users.service';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private rolesService: RolesService,
    private userService: UsersService,
  ) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: UserLoginDto })
  @Post('/login')
  @ResponseMessages('User Login')
  handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() { }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res: Response) {
    const token = await this.authService.login(req.user, res);

    const frontendURL = 'http://localhost:3000';
    res.redirect(`${frontendURL}?token=${token}`);
  }

  @Public()
  @ResponseMessages('Register a new user')
  @Post('/register')
  handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @ResponseMessages('Get user information')
  @Get('/account')
  async handleGetAccount(@UserS() user: IUser) {
    const temp = (await this.rolesService.findOne(user.role._id)) as any;
    const userData = (await this.userService.findOne(user._id)) as any;
    const {
      _id,
      name,
      email,
      role,
      age,
      gender,
      company,
      address,
      isDeleted,
      isActived,
      permissions = temp.permissions,
      hr
    } = userData;
    return {
      user: {
        _id,
        name,
        email,
        role,
        age,
        company,
        gender,
        address,
        permissions,
        isDeleted,
        isActived,
        hr
      }
    };
  }

  @Public()
  @ResponseMessages('Get User by refresh token')
  @Get('/refresh')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
  }

  @ResponseMessages('Logout User')
  @Post('/logout')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @UserS() user: IUser,
  ) {
    return this.authService.logout(response, user);
  }

  // @Public()
  // @Get('/active')
  // async activeAccount(
  //   @Query('email') email: string,
  //   @Query('otp') otp: string,
  //   @Res() response: Response
  // ) {
  //   const { redirectUrl } = await this.authService.activeAccount(email, otp);
  //   response.redirect(redirectUrl);
  // }
  @Public()
  @Post('/active')
  async activeAccount(@Body() validateOtpDto: ValidateOtpDto) {
    const msg = this.authService.activeAccount(
      validateOtpDto.email,
      validateOtpDto.otp,
    );
    return msg;
  }
  @UseGuards(JwtAuthGuard)
  @Post('/change-password')
  async changePassword(
    @UserS() user: IUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user._id, changePasswordDto);
  }

  @Public()
  @Post('/forget')
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { CreateUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { RolesService } from 'src/roles/roles.service';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import * as generatePassword from 'generate-password';
import { UserS } from 'src/decorator/customize';
import { VerificationService } from 'src/verification/verification.service';
import { CreateVerificationDto } from 'src/verification/dto/create-verification.dto';
import { MailService } from 'src/mail/mail.service';
import { ChangePasswordDto, ForgetPasswordDto } from './dto/changePassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesService: RolesService,
    private verificationService: VerificationService,
    private mailService: MailService,
  ) {}

  //ussername/ pass là 2 tham số thư viện passport nó ném về
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isValidPwd = this.usersService.isValidPassword(pass, user.password);
      if (isValidPwd === true) {
        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.rolesService.findOne(userRole._id);

        const objUser = {
          ...user.toObject(),
          permissions: temp?.permissions ?? [],
        };
        return objUser;
      }
    }

    return null;
  }

  async login(user: IUser, response: Response) {
    const {
      _id,
      name,
      email,
      role,
      permissions,
      age,
      gender,
      company,
      address,
      isDeleted,
      isActived,
      hr
    } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };

    const refresh_token = this.createRefreshToken(payload);

    //update user with refresh token
    await this.usersService.updateUserToken(refresh_token, _id);

    //set refresh_token as cookies
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
    });

    return {
      access_token: this.jwtService.sign(payload),
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
      },
    };
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.usersService.findOneByUsername(googleUser.email);
    if (user) {
      const userRole = user.role as unknown as { _id: string; name: string };
      const temp = await this.rolesService.findOne(userRole._id);
      const objUser = {
        ...user.toObject(),
        permissions: temp?.permissions ?? [],
      };
      return objUser;
    }
    googleUser.password = this.generateRandomPassword();
    googleUser.isActived = true;
    return await this.usersService.register(googleUser);
  }

  async register(user: RegisterUserDto) {
    let newUser = await this.usersService.register(user);
    await this.mailService.sendVerify(newUser.email);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  // async activeAccountS(email: string, otp: string) {
  //     const isValid = await this.verificationService.validateOtp(email, otp)
  //     if (!isValid) {
  //         throw new BadRequestException(`Mã OTP không hợp lệ.`)
  //     }
  //     const redirectUrl = `https://www.facebook.com`;
  //     return { message: `${email} has been activated`, redirectUrl };
  // }

  async activeAccount(email: string, otp: string) {
    const isValid = await this.verificationService.validateOtp(email, otp);
    if (!isValid) {
      throw new BadRequestException(`Mã OTP không hợp lệ.`);
    }
    // Activate the user
    await this.usersService.activeAccount(email, true);
    return email + ' has been Actived';
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isOldPasswordValid = compareSync(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedNewPassword = this.getHashPassword(newPassword);
    await this.usersService.updateUserPassword(userId, hashedNewPassword);

    return { message: 'Password changed successfully' };
  }

  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    const { email, newPassword } = forgetPasswordDto;

    const user = await this.usersService.findOneByUsername(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isOtpValid = await this.verificationService.validateOtp(
      user.email,
      forgetPasswordDto.otp,
    );
    if (!isOtpValid) {
      throw new BadRequestException('OTP is incorrect');
    }
    const hashedNewPassword = this.getHashPassword(newPassword);
    await this.usersService.updateUserPassword(
      user._id.toString(),
      hashedNewPassword,
    );

    return { message: 'Password changed successfully' };
  }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  generateRandomPassword(length: number = 8): string {
    return generatePassword.generate({
      length: length,
      numbers: true,
      symbols: true,
      uppercase: true,
      excludeSimilarCharacters: true,
      strict: true,
    });
  }

  createRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
    return refresh_token;
  };

  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      let user = await this.usersService.findUserByToken(refreshToken);
      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };

        const refresh_token = this.createRefreshToken(payload);

        //update user with refresh token
        await this.usersService.updateUserToken(refresh_token, _id.toString());

        //fetch user's role
        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.rolesService.findOne(userRole._id);

        //set refresh_token as cookies
        response.clearCookie('refresh_token');

        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
        });

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role,
            permissions: temp?.permissions ?? [],
          },
        };
      } else {
        throw new BadRequestException(
          `Refresh token không hợp lệ. Vui lòng login.`,
        );
      }
    } catch (error) {
      throw new BadRequestException(
        `Refresh token không hợp lệ. Vui lòng login.`,
      );
    }
  };

  logout = async (response: Response, user: IUser) => {
    await this.usersService.updateUserToken('', user._id);
    response.clearCookie('refresh_token');
    return 'ok';
  };
}

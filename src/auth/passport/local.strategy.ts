import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Tài khoản/ mật khẩu không đúng !');
    }
    if (!user.isActived) {
      //FE đẩy qua trang verify nhá
      throw new UnauthorizedException('Tài khoản của bạn chưa được xác thực');
    }
    return user;
  }
}

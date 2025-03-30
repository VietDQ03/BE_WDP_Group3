import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import google_oauthConfig from '../configs/google_oauth.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { HRStatus } from 'src/users/schemas/user.schema';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(google_oauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof google_oauthConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clientID,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      name: profile.displayName,
      avatarUrl: profile.photos[0].value || "",
      password: "",
      age: null,
      gender: null,
      address: null,
      isActived: true,
      premium: 2, // thêm trường premium mặc định = 2
      hr: profile.hr || HRStatus.ACTIVE  // If profile.hr is null/undefined, use ACTIVE as default
    }); 
    done(null, user)
  }
}
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './passport/jwt.strategy';
import { CompaniesModule } from 'src/companies/companies.module';
import { AuthController } from './auth.controller';
import { RolesModule } from 'src/roles/roles.module';
import { GoogleStrategy } from './passport/google.strategy';
import google_oauthConfig from './configs/google_oauth.config';
import { VerificationModule } from 'src/verification/verification.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  imports: [
    CompaniesModule,
    UsersModule,
    PassportModule,
    RolesModule,
    VerificationModule,
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule.forFeature(google_oauthConfig),
    JwtModule.registerAsync({
      imports: [
        ConfigModule
      ],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRED'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
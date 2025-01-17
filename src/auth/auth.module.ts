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

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    CompaniesModule,
    UsersModule,
    PassportModule,
    RolesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Thay secretOrPrivateKey bằng secret
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
export class AuthModule {}
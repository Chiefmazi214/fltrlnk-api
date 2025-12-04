import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { VerificationModule } from 'src/verification/verification.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthGuard } from './guards/auth.guard';
import { PassportModule } from '@nestjs/passport';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { WsAuthGuard } from './guards/ws-auth.guard';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'google' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    VerificationModule,
  ],
  providers: [AuthService, AuthGuard, GoogleStrategy, FacebookStrategy, WsAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard, WsAuthGuard],
})
export class AuthModule {}

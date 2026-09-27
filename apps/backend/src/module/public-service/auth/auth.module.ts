import { Module } from '@nestjs/common';  

import { AuthCookieService } from '@/config/auth-cookie.service.js';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GithubStrategy } from './strategies/github.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { ControllerModule } from './controller/module.js';
import { JwtAuthModule } from './services/jwt/jwt.module.js';


@Module({
  imports: [
    ControllerModule,

  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCookieService,
    GoogleStrategy,
    GithubStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}

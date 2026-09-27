import { Module } from '@nestjs/common';

import { AuthCookieService } from '@/config/auth-cookie.service.js';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { OauthModule } from './oauth/oauth-accounts.module.js';
import { PasswordModule } from './passwords/user-passwords.module.js';
import { AuthenticatedGuard } from './permission/guards/authenticated.guard.js';
import { JwtAuthModule } from './services/jwt/jwt.module.js';
import { SessionModule } from './sessions/sessions.module.js';
import { GithubStrategy } from './strategies/github.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { UserModule } from './users/users.module.js';

@Module({
  imports: [
    UserModule,
    PasswordModule,
    OauthModule,
    SessionModule,
    JwtAuthModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCookieService,
    AuthenticatedGuard,
    GoogleStrategy,
    GithubStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}

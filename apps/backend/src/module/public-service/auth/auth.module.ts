import { Module } from '@nestjs/common';

import { AuthService } from './auth.service.js';

import { OauthModule } from './oauth/oauth-accounts.module.js';
import { PasswordModule } from './passwords/user-passwords.module.js';
import { JwtAuthModule } from './services/jwt/jwt.module.js';
import { UserModule } from './users/users.module.js';

import { AuthController } from './auth.controller.js';
import { GithubStrategy } from './strategies/github.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';

@Module({
  imports: [
    UserModule,
    PasswordModule,
    OauthModule,
    JwtAuthModule,
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    GoogleStrategy,
    GithubStrategy,
  ],

  exports: [
    AuthService,
  ],
})
export class AuthModule {}
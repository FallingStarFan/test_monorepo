import { Module } from '@nestjs/common';
import { OauthAccountsModule } from './tables/oauth/oauth-accounts.module.js';
import { OAuthController } from './oauth.controller.js';
import { UsersModule } from './tables/users/users.module.js';
import { AuthResponseMapper } from './auth-response.mapper.js';

import { AuthCookieService } from '@/config/auth-cookie.service.js';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GithubStrategy } from './strategies/github.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { AppModule } from '@/app.module.js';
import { RolesModule } from './tables/role/roles.module.js';
import { UserRolesModule } from './tables/user-role/user-roles.module.js';
import { UserPasswordsModule } from './tables/user-passwords/user-passwords.module.js';
import { AppsModule } from './tables/app/apps.module.js';
import { AuthTokenController } from './auth-token.controller.js';


@Module({
  imports: [
    AppsModule,
    UsersModule,
    UserPasswordsModule,
    RolesModule,
    
    UserRolesModule,
    
    OauthAccountsModule,
  ],
  controllers: [
    AuthController,
    AuthTokenController,
    OAuthController,
  ],
  providers: [
    AuthService,
    AuthResponseMapper,
    AuthCookieService,
    GoogleStrategy,
    GithubStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}

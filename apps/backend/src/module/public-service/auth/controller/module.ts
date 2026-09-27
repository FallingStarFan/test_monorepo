// controller/module.ts
import { Module } from '@nestjs/common';


import { AuthCookieService } from '@/config/auth-cookie.service.js';

import { AppController } from './app.controller.js';
import { OauthAccountController } from './oauth-accounts.controller.js';
import { RoleController } from './role.controller.js';
import { UserRoleController } from './user-role.controller.js';
import { UserPasswordController } from './user-passwords.controller.js';
import { UserController } from './users.controller.js';

import { AppService } from '../services/app.service.js';
import { OauthAccountService } from '../services/oauth-accounts.service.js';
import { RoleService } from '../services/role.service.js';
import { UserRoleService } from '../services/user-role.service.js';
import { UserPasswordService } from '../services/user-passwords.service.js';
import { UserService } from '../services/users.service.js';


@Module({
 
  controllers: [
    AppController,
    UserController,
    UserRoleController,
    RoleController,
    OauthAccountController,
    UserPasswordController,
   
  ],
  providers: [
    AuthCookieService,
    AppService,
    RoleService,
    UserService,
    UserRoleService,
    UserPasswordService,
    OauthAccountService, // 補上
  ],
  exports: [
    AuthCookieService,
    AppService,
    RoleService,
    UserService,
    UserRoleService,
    UserPasswordService,
    OauthAccountService, // 補上，AuthModule 才能使用
  ],
})
export class ControllerModule {}
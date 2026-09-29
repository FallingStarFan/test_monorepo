// controller/module.ts
import { Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service.js';
import { AuthRolesService } from './auth-role.service.js';







@Module({
 
  controllers: [
    // OauthAccountsController,
  ],
  providers: [
   UserRolesService,
   AuthRolesService,
  ],
  exports: [
    UserRolesService,
    AuthRolesService,
  ],
})
export class UserRolesModule {}
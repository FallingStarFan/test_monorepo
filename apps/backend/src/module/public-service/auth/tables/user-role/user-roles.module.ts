// controller/module.ts
import { Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service.js';







@Module({
 
  controllers: [
    // OauthAccountsController,
  ],
  providers: [
   UserRolesService,
  ],
  exports: [
    UserRolesService,
  ],
})
export class UserRolesModule {}
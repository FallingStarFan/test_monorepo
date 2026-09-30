// controller/module.ts
import { Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service.js';
import { AuthRolesService } from './auth-role.service.js';
import { UserRolesController } from './user-roles.controller.js';







@Module({
 
  controllers: [
    UserRolesController,
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
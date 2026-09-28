// controller/module.ts
import { Module } from '@nestjs/common';
import { UserPasswordsService } from './user-passwords.service.js';







@Module({
 
  controllers: [
    // OauthAccountsController,
  ],
  providers: [
    UserPasswordsService,
  ],
  exports: [
    UserPasswordsService,
  ],
})
export class UserPasswordsModule {}
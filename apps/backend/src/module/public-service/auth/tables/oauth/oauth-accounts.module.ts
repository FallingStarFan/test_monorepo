// controller/module.ts
import { Module } from '@nestjs/common';
import { OauthAccountsService } from './oauth-accounts.service.js';







@Module({
 
  controllers: [
    // OauthAccountsController,
  ],
  providers: [
    OauthAccountsService,
  ],
  exports: [
    OauthAccountsService,
  ],
})
export class OauthAccountsModule {}
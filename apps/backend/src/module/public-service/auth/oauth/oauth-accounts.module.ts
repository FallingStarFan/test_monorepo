import { Module } from '@nestjs/common';

import { OauthAccountController } from './oauth-accounts.controller.js';
import { OauthAccountService } from './oauth-accounts.service.js';

@Module({
  /**
   * 為什麼：
   * Controller 必須註冊在 Module，
   * NestJS 才會建立它提供的 HTTP 路由，
   * Swagger 也才能掃描到這些 API。
   */
  // controllers: [OauthAccountController],

  /**
   * 為什麼：
   * 把 OAuth Account Service 註冊到 NestJS DI，
   * Controller 才能透過 constructor 注入使用。
   */
  providers: [OauthAccountService],

  /**
   * 為什麼：
   * 讓 AuthModule 或其他 Module 可以使用
   * OauthAccountService。
   */
  exports: [OauthAccountService],
})
export class OauthModule {}


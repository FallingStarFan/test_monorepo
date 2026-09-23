import { Module } from '@nestjs/common';

import { SessionController } from './sessions.controller.js';
import { SessionService } from './sessions.service.js';

@Module({
  /**
   * 為什麼：
   * 將 SessionService 註冊到 NestJS DI。
   */
  // controllers: [SessionController],
  providers: [SessionService],

  /**
   * 為什麼：
   * 讓 AuthService 可以使用 Session 建立、驗證與撤銷功能。
   */
  exports: [SessionService],
})
export class SessionModule {}

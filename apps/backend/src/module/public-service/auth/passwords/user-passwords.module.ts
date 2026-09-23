import { Module } from '@nestjs/common';

import { UserPasswordController } from './user-passwords.controller.js';
import { UserPasswordService } from './user-passwords.service.js';

@Module({
  /**
   * 為什麼：
   * 將 UserPasswordService 註冊到 NestJS DI。
   */
  // controllers: [UserPasswordController],
  providers: [UserPasswordService],

  /**
   * 為什麼：
   * 讓 AuthService 等其他 Module 可以使用密碼相關功能。
   */
  exports: [UserPasswordService],
})
export class PasswordModule {}
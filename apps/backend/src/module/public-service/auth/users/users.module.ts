// src/user/user.module.ts

import { Module } from '@nestjs/common';

import { UserService } from './users.service.js';
import { UserController } from './users.controller.js';

@Module({
  // controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
// controller/module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';






@Module({
 
  controllers: [
    // UsersController,
  ],
  providers: [
    UsersService,
  ],
  exports: [
   
    UsersService,
  ],
})
export class UsersModule {}
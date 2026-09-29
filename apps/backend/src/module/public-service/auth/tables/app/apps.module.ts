// controller/module.ts
import { Module } from '@nestjs/common';
import { AppsService } from './apps.service.js';
import { AppsController } from './apps.controller.js';






@Module({
 
  controllers: [
    // AppsController,
  ],
  providers: [
    AppsService,
  ],
  exports: [
   
    AppsService,
  ],
})
export class AppsModule {}
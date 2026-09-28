// controller/module.ts
import { Module } from '@nestjs/common';
import { AppsService } from './apps.service.js';






@Module({
 
  controllers: [
    // RolesController,
  ],
  providers: [
    AppsService,
  ],
  exports: [
   
    AppsService,
  ],
})
export class AppsModule {}
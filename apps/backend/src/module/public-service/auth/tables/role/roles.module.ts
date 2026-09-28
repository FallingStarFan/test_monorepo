// controller/module.ts
import { Module } from '@nestjs/common';
import { RolesService } from './roles.service.js';






@Module({
 
  controllers: [
    // RolesController,
  ],
  providers: [
    RolesService,
  ],
  exports: [
   
    RolesService,
  ],
})
export class RolesModule {}
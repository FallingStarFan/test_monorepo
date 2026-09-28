import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { AppsService } from './apps.service.js';



@Controller('apps')
export class AppsController {
  constructor(
    private readonly appService: AppsService,
  ) {}

  // 取得所有 App
  @Get()
  findAll() {
    return this.appService.findAll();
  }

  // 取得單一 App
  @Get(':id')
  findById(
    @Param('id') id: string,
  ) {
    return this.appService.findById(id);
  }
}
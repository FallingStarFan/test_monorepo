import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { AppService } from '../services/app.service.js';



@Controller('apps')
export class AppController {
  constructor(
    private readonly appService: AppService,
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
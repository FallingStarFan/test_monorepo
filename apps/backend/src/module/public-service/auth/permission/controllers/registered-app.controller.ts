import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AppService } from '../../app/app.service.js';

/** 未登入也可讀取的共用服務註冊 App 清單。 */
@ApiTags('App')
@Controller('apps')
export class RegisteredAppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List registered apps / 取得已註冊 App 清單',
  })
  @ApiResponse({
    status: 200,
    description: '成功回傳已註冊的 App 清單。',
  })
  findAll() {
    return this.appService.findAll();
  }
}

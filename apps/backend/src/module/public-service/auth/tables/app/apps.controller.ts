import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEnvelopeResponse } from '@/common/response/swagger-response.decorator.js';
import { MESSAGES } from '@/common/response/messages.js';
import { AppsService } from './apps.service.js';
import { AppDto } from './dto/app.dto.js';

@ApiTags('Auth/Apps')
@Controller('apps')
export class AppsController {
  constructor(private readonly appService: AppsService) {}

  // 取得所有 App
  @Get()
  @ApiEnvelopeResponse({
    status: 200,
    message: MESSAGES.APPS_RETRIEVED,
    data: AppDto,
    isArray: true,
  })
  findAll() {
    return this.appService.findAll();
  }

  // 取得單一 App
  @Get(':id')
  @ApiEnvelopeResponse({
    status: 200,
    message: MESSAGES.APP_RETRIEVED,
    data: AppDto,
  })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.appService.findById(id);
  }
}

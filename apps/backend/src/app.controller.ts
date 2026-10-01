import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { MESSAGES } from './common/response/messages.js';
import { ResponseMessage } from './common/response/response-message.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ResponseMessage(MESSAGES.SERVICE_STATUS_RETRIEVED)
  getHello(): string {
    return this.appService.getHello();
  }
}

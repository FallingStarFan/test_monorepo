import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import type { PageQueryDto } from '@/common/pagination/page-query.dto.js';
import { AppNotificationService } from './tables/app-notification/app-notification.service.js';
import { EmailNotificationLogService } from './tables/email-notification-log/email-notification-log.service.js';
import { MESSAGES } from '@/common/response/messages.js';
import { ResponseMessage } from '@/common/response/response-message.decorator.js';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly appNotificationService: AppNotificationService,
    private readonly emailNotificationLogService: EmailNotificationLogService,
  ) {}

  // ============================================================
  // App Notification
  // ============================================================

  @Get('app/user/:userId')
  @ApiOperation({
    summary: 'Get user app notifications',
    description: '取得指定使用者的 App Notification，依建立時間由新到舊排序。',
  })
  @ApiParam({
    name: 'userId',
    description: '使用者 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得使用者的 App Notification。',
  })
  @ResponseMessage(MESSAGES.APP_NOTIFICATIONS_RETRIEVED)
  findAppNotifications(@Param('userId') userId: string) {
    return this.appNotificationService.findByUserId(userId);
  }

  @Get('app/:id')
  @ApiOperation({
    summary: 'Get app notification',
    description: '取得指定的 App Notification。',
  })
  @ApiParam({
    name: 'id',
    description: 'App Notification ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得 App Notification。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的 App Notification。',
  })
  @ResponseMessage(MESSAGES.APP_NOTIFICATION_RETRIEVED)
  findAppNotification(@Param('id') id: string) {
    return this.appNotificationService.findById(id);
  }

  @Post('app')
  @ApiOperation({
    summary: 'Create app notification',
    description: '建立一筆 App Notification，供 Notification Center 顯示。',
  })
  @ApiBody({
    description: 'App Notification 資料',
    schema: {
      type: 'object',
      required: ['userId', 'type', 'title', 'linkPath'],
      properties: {
        userId: {
          type: 'string',
          description: '接收通知的使用者 ID',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        type: {
          type: 'string',
          description: '通知類型',
          example: 'comment_mention',
        },
        title: {
          type: 'string',
          description: '通知標題',
          example: 'Someone mentioned you',
        },
        body: {
          type: 'string',
          nullable: true,
          description: '通知內容',
          example: 'You were mentioned in a comment.',
        },
        linkPath: {
          type: 'string',
          description: '點擊通知後前往的前端 Path',
          example: '/project/video?contentId=123&commentId=456',
        },
        actorUserId: {
          type: 'string',
          nullable: true,
          description: '觸發通知的使用者 ID',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        actorLabel: {
          type: 'string',
          nullable: true,
          description: '觸發者顯示名稱快照',
          example: 'John',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '成功建立 App Notification。',
  })
  @ResponseMessage(MESSAGES.APP_NOTIFICATION_CREATED)
  createAppNotification(
    @Body()
    body: {
      userId: string;
      type: string;
      title: string;
      body?: string;
      linkPath: string;
      actorUserId?: string;
      actorLabel?: string;
    },
  ) {
    return this.appNotificationService.create(body);
  }

  @Patch('app/:id/read')
  @ApiOperation({
    summary: 'Mark app notification as read',
    description: '將指定的 App Notification 標記為已讀。',
  })
  @ApiParam({
    name: 'id',
    description: 'App Notification ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: '成功將通知標記為已讀。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的 App Notification。',
  })
  @ResponseMessage(MESSAGES.APP_NOTIFICATION_READ)
  markAppNotificationAsRead(@Param('id') id: string) {
    return this.appNotificationService.markAsRead(id);
  }

  // ============================================================
  // Email Notification Log
  // ============================================================

  @Get('email-logs')
  @ApiOperation({
    summary: 'Get email notification logs',
    description: '取得 Email Notification Log，依建立時間由新到舊排序。',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得 Email Notification Log。',
  })
  @ResponseMessage(MESSAGES.EMAIL_LOGS_RETRIEVED)
  async findAll(@Query() query: PageQueryDto) {
    const emailLogs = await this.emailNotificationLogService.findAllPageable(
      query.page,
      query.pageSize,
      query.order,
    );

    return emailLogs;
  }

  @Get('email-logs/:id')
  @ApiOperation({
    summary: 'Get email notification log',
    description: '取得指定的 Email Notification Log。',
  })
  @ApiParam({
    name: 'id',
    description: 'Email Notification Log ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得 Email Notification Log。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的 Email Notification Log。',
  })
  @ResponseMessage(MESSAGES.EMAIL_LOG_RETRIEVED)
  async findEmailNotificationLogByPage(
    @Param('id') id: string,
    @Query() query: PageQueryDto,
  ) {
    const emailLogs = await this.emailNotificationLogService.findByIdPageable(
      id,
      query.page,
      query.pageSize,
      query.order,
    );

    return emailLogs;
  }
}

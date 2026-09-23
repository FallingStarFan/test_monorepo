import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';


import { AuthModule } from './module/public-service/auth/auth.module.js';
import { PermissionModule } from './module/public-service/auth/permission/permission.module.js';
import { FileModule } from './module/public-service/file/file.module.js';
import { NotificationModule } from './module/public-service/notification/notification.module.js';
import { PrismaModule } from './module/public-service/prisma/prisma.module.js';

@Module({
  imports: [
    // 讓 NestJS 載入 .env，
    // 並把 ConfigService 設定成全域可注入。
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Prisma database client
    PrismaModule,

    // Authentication
    AuthModule,
    // Permission：細粒度權限（Permission / RolePermission + Guard 與管理 API）
    PermissionModule,
    // File
    FileModule,
    // Notification
    NotificationModule,
  ],
})
export class AppModule {}
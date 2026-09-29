import { Module } from '@nestjs/common';

import { NotificationController } from './notification.controller.js';

import { EMAIL_PROVIDER } from './intergration/emil.provider.js';
import { ResendEmailProvider } from './intergration/resend/resend-email.provider.js';
import { EmailService } from './services/email.service.js';
import { AppNotificationService } from './tables/app-notification/app-notification.service.js';
import { EmailNotificationLogService } from './tables/email-notification-log/email-notification-log.service.js';

@Module({
  controllers: [NotificationController],
  providers: [
    AppNotificationService,
    EmailNotificationLogService,
    EmailService,
     {
      provide: EMAIL_PROVIDER,
      useClass: ResendEmailProvider,
    },
  ],
  exports: [
    AppNotificationService,
    EmailNotificationLogService,
    EmailService,
  ],
})
export class NotificationModule {}
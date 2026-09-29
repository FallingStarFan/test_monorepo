import {
    Inject,
    Injectable,
} from '@nestjs/common';
import { EMAIL_PROVIDER, type EmailProvider, type EmailSendParams } from '../intergration/emil.provider.js';
import { EmailNotificationLogService } from '../tables/email-notification-log/email-notification-log.service.js';

@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider,

    private readonly emailNotificationLogService:
      EmailNotificationLogService,
  ) {}

  async send(
    params: EmailSendParams,
  ) {
    const result =
      await this.emailProvider.send(params);

    await this.emailNotificationLogService.create({
      recipient: Array.isArray(params.to)
        ? params.to.join(',')
        : params.to,
      provider: 'resend',
      subject: params.subject,
      bodyHtml: params.html,
    });

    return result;
  }
}
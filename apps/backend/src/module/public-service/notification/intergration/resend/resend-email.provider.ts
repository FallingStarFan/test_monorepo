import { Resend } from 'resend';

import env from '@/config/env.js';
import type { EmailProvider, EmailSendParams, EmailSendResult } from '../emil.provider.js';



export class ResendEmailProvider
  implements EmailProvider
{
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(
      env.resendApiKey,
    );
  }

  async send(
    params: EmailSendParams,
  ): Promise<EmailSendResult> {
    const { data, error } =
      await this.resend.emails.send({
        from: env.resendFromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

    if (error) {
      throw new Error(
        `Failed to send email: ${error.message}`,
      );
    }

    if (!data) {
      throw new Error(
        'Resend did not return email data.',
      );
    }

    return {
      id: data.id,
    };
  }
}
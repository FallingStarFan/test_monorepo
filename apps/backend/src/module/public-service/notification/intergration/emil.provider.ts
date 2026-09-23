export interface EmailProvider {
  send(
    params: EmailSendParams,
  ): Promise<EmailSendResult>;
}

export interface EmailSendParams {
  to: string | string[];
  subject: string;
  html: string;
}

export interface EmailSendResult {
  id: string;
}

export const EMAIL_PROVIDER =
  Symbol('EMAIL_PROVIDER');
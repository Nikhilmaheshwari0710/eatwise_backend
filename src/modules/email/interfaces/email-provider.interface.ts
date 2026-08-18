export interface EmailAddress {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: EmailAddress[];
  subject: string;
  text: string;
  html: string;
  replyTo?: EmailAddress;
}

export interface PasswordResetEmailOptions {
  to: EmailAddress;
  otp: string;
  expiresInMinutes: number;
  fullName?: string;
}

export interface VerificationEmailOptions {
  to: EmailAddress;
  otp: string;
  expiresInMinutes: number;
  fullName?: string;
}

export interface EmailProvider {
  sendEmail(options: SendEmailOptions): Promise<void>;
}

export const EMAIL_PROVIDER = 'EMAIL_PROVIDER';

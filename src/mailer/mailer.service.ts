import { Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService as Mailer } from '@nestjs-modules/mailer';

interface AdminMailContext {
  email: string;
  password: string;
}

interface SignUpMailContext {
  email: string;
  token: string;
}

interface MailerPayload<T extends Record<string, any>> {
  to: string;
  context: T;
}

@Injectable()
export class MailerService {
  constructor(private readonly mailer: Mailer) {}

  private async sendMail(options: ISendMailOptions) {
    return this.mailer.sendMail(options);
  }

  async sendAdminEmail(payload: MailerPayload<AdminMailContext>) {
    return this.sendMail({
      ...payload,
      subject: 'Your admin account credentials',
      template: 'admin',
    });
  }

  async sendSignUpEmail(payload: MailerPayload<SignUpMailContext>) {
    return this.sendMail({
      ...payload,
      subject: 'Welcome to our service',
      template: 'confirm'
    });
  }
}

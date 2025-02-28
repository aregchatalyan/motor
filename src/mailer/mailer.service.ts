import { Injectable } from '@nestjs/common';
import { MailerService as Mailer } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: Mailer) {}

  async sendMail({ to, subject, template, context }) {
    await this.mailerService.sendMail({ to, subject, template, context });
  }
}

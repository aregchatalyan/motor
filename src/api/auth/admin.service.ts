import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { hash } from '../../utils/bcrypt';
import { MailerService } from '../../mailer/mailer.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService implements OnApplicationBootstrap {

  constructor(
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
    private readonly prisma: PrismaService
  ) {}

  async onApplicationBootstrap() {
    const adminEmail = this.config.getOrThrow('ADMIN_EMAIL');
    const adminMobile = this.config.getOrThrow('ADMIN_MOBILE');

    const exists = await this.prisma.user.findUnique({
      where: {
        email: adminEmail,
        roles: {
          some: { role: $Enums.Role.admin }
        }
      }
    });

    if (!exists) {
      const password = this.generatePassword();
      const passwordHash = await hash(password);

      const admin = await this.prisma.user.create({
        data: {
          name: 'admin',
          surname: '',
          email: adminEmail,
          mobile: adminMobile,
          password: passwordHash,
          active: true,
          confirmed: true,
          roles: {
            create: [ { role: 'admin' } ]
          }
        }
      });

      await this.mailer.sendMail({
        to: admin.email,
        subject: 'Your Admin Account Password',
        template: 'admin',
        context: { password }
      });
    } else {
      console.log('ℹ️ Admin user already exists.');
    }
  }

  generatePassword(): string {
    return randomBytes(6).toString('base64').slice(0, 10);
  }
}

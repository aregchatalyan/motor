import { randomBytes } from 'node:crypto';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { RoleEnum } from 'prisma/client';
import { hash } from '../../utils/bcrypt';
import { EnvConfig, envConfig } from '../../config/env';
import { MailerService } from '../../mailer/mailer.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService implements OnApplicationBootstrap {
  constructor(
    @Inject(envConfig.KEY)
    private readonly config: EnvConfig,
    private readonly mailer: MailerService,
    private readonly prisma: PrismaService
  ) {}

  async onApplicationBootstrap() {
    const { ADMIN_EMAIL } = this.config;

    const admin = await this.prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: { email: true }
    });

    if (!admin) {
      const password = randomBytes(8).toString('base64').slice(0, 10);

      try {
        await this.prisma.user.create({
          data: {
            username: 'admin',
            email: ADMIN_EMAIL,
            password: await hash(password),
            active: true,
            verified: true,
            roles: [ RoleEnum.ADMIN ]
          }
        });

        await this.mailer.sendAdminEmail({ to: ADMIN_EMAIL, context: { email: ADMIN_EMAIL, password } });
      } catch (e) {
        if (e.code === 'P2002') {
          console.log('Admin account already exists');
        } else {
          console.error('Failed to create admin account:', e.message);
        }
      }
    } else {
      console.log(`Admin account already exists: ${ admin.email }`);
    }
  }
}

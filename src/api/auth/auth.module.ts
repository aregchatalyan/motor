import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailerService } from '../../mailer/mailer.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow<string>('JWT_ACCESS_EXPIRES')
        }
      })
    })
  ],
  controllers: [ AuthController ],
  providers: [
    AuthService,
    MailerService,
    PrismaService
  ]
})
export class AuthModule {}

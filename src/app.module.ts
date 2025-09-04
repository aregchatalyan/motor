import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { envConfig } from './config/env';
import { AuthModule } from './api/auth/auth.module';
import { FileModule } from './api/file/file.module';
import { MailerModule } from './mailer/mailer.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './api/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ envConfig ],
      expandVariables: true
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../uploads'),
      serveRoot: '/api/uploads'
    }),
    AuthModule,
    FileModule,
    MailerModule,
    PrismaModule,
    ProfileModule
  ]
})
export class AppModule {}

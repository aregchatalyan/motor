import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './api/auth/auth.module';
import { UserModule } from './api/user/user.module';
import { FileModule } from './api/file/file.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../uploads'),
      serveRoot: '/uploads'
    }),
    AuthModule,
    UserModule,
    MailerModule,
    FileModule
  ]
})
export class AppModule {}

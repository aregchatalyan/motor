import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EnvConfig, envConfig } from './config/env';
import { AuthModule } from './api/auth/auth.module';
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
    ThrottlerModule.forRootAsync({
      imports: [ ConfigModule.forFeature(envConfig) ],
      inject: [ envConfig.KEY ],
      useFactory: (config: EnvConfig) => [
        {
          ttl: config.THROTTLE_TTL,
          limit: config.THROTTLE_LIMIT
        }
      ]
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../uploads'),
      serveRoot: '/api/uploads'
    }),
    AuthModule,
    MailerModule,
    PrismaModule,
    ProfileModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}

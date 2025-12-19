import cookies from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ENV_CONFIG, EnvConfig } from './config/env';
import { HttpExceptionFilter } from './common/http.filter';
import { HttpInterceptor } from './common/http.interceptor';
import { LoggerInterceptor } from './common/logger.interceptor';

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = app.get(ConfigService);
  const { PORT, DEBUG, CLIENTS } = config.getOrThrow<EnvConfig>(ENV_CONFIG);

  app.use(cookies());

  app.enableCors({
    credentials: true,
    origin: CLIENTS
  });

  app.setGlobalPrefix('/api');

  app.useGlobalInterceptors(new HttpInterceptor());
  if (DEBUG) app.useGlobalInterceptors(new LoggerInterceptor());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
      return new BadRequestException(
        errors.reduce((acc, e) => {
          if (e.constraints) {
            acc[e.property] = Object.values(e.constraints);
          }
          return acc;
        }, {} as Record<string, string[]>)
      );
    }
  }));

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(PORT, () => {
    console.log('Server running on port:', PORT);
  });
})();

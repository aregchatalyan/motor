import cookies from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ENV_CONFIG, EnvConfig } from './config/env';
import { LoggerInterceptor } from './logger/logger.interceptor';

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

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }));

  if (DEBUG) app.useGlobalInterceptors(new LoggerInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Motor REST API')
    .setVersion('1.0')
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig), {
    swaggerOptions: { defaultModelsExpandDepth: -1 }
  });

  await app.listen(PORT, () => {
    console.log('Server running on port:', PORT);
  });
})();

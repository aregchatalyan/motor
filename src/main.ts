import cookies from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerInterceptor } from './logger/logger.interceptor';

(async () => {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({ prefix: 'Motor' })
  });

  const config = app.get<ConfigService>(ConfigService);
  const PORT = config.get<string>('PORT') || 3030;
  const DEBUG = config.get<string>('DEBUG') === 'true';
  const CLIENT_URL = config.getOrThrow<string>('CLIENT_URL');

  app.use(cookies());

  app.enableCors({
    credentials: true,
    origin: CLIENT_URL
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
    .setDescription('Created by Nest.js')
    .setVersion('1.0')
    .build();

  SwaggerModule.setup('api/docs', app, () => {
    return SwaggerModule.createDocument(app, swaggerConfig);
  }, { swaggerOptions: { defaultModelsExpandDepth: -1 } });

  await app.listen(PORT, () => {
    console.log('Server running on port:', PORT);
  });
})();

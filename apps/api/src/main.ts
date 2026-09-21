import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Cookie parsing middleware
  app.use(cookieParser());

  // Global prefix: /api/v1
  app.setGlobalPrefix('api/v1');

  // Request validation pipe with automatic transformation & whitelisting
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  // Global unified error filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS configuration
  const allowedOrigins = [
    process.env.WEB_URL || 'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      callback(new Error('CORS policy: Not allowed by CORS origin'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'Cookie']
  });

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('AdaptiveMath API')
    .setDescription('Hệ thống học tập Toán thích ứng chuẩn Bộ GD&ĐT (Lớp 9 & Ôn thi vào 10)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('am_session')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 AdaptiveMath REST API running at: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger OpenAPI Documentation at: http://localhost:${port}/api/docs`);
}

bootstrap();

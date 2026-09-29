import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';

import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/response/filters/http-exception.filter.js';
import { ResponseInterceptor } from './common/response/response.interceptor.js';
import env from './config/env.js';
import { setupSwagger } from './config/swagger.config.js';
import { ValidationPipe } from '@nestjs/common/pipes/index.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  app.setGlobalPrefix('api');
  app.use(cookieParser());


  
  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }),
);

  app.enableCors({
    origin: env.corsOrigins,
    credentials: true,
  });

  // SameSite=Lax blocks ordinary cross-site POSTs. Origin validation adds a
  // second boundary for cookie-authenticated mutations and same-site subdomains.
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (
      request.method === 'OPTIONS' ||
      !['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
    ) {
      return next();
    }

    const origin = request.headers.origin;
    const allowedOrigins = new Set([
      ...env.corsOrigins,
      new URL(env.backendUrl).origin,
    ]);

    if (origin && !allowedOrigins.has(origin)) {
      return response.status(403).json({
        statusCode: 403,
        message: {
          en: 'Request origin is not allowed',
          zh: '不允許此請求來源',
        },
        data: null,
      });
    }

    return next();
  });

  setupSwagger(app);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(env.serverPort);

  console.log(`API: ${env.backendUrl}`);
  console.log(`Swagger: ${env.backendUrl}/docs`);
}

await bootstrap();

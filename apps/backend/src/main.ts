import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/response/filters/http-exception.filter.js';
import env from './config/env.js';
import { setupSwagger } from './config/swagger.config.js';

/**
 * 啟動 NestJS Application。
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  /**
   * 啟用 Cookie Parser。
   *
   * 用於讀取 HttpOnly Session Cookie 等 Cookie 資訊。
   */
  app.use(cookieParser());

  /**
   * 啟用 CORS。
   *
   * `credentials: true` 允許前端攜帶 Cookie。
   *
   * 注意：
   * 如果未來 Frontend Domain 改變，
   * 需要同步調整 `origin`。
   */
  app.enableCors({
    origin: env.webOrigin,
    credentials: true,
  });

  /**
   * 初始化 Swagger API 文件。
   *
   * Swagger UI：
   * http://localhost:{port}/docs
   */
  setupSwagger(app);

  /**
   * 使用環境設定中的 API Port。
   *
   * 若未設定，預設使用 3013。
   */
  const port = env.serverPort;

  /**
   * 設定全域 HTTP Exception Filter。
   *
   * 統一處理 API Exception Response 格式。
   */

  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );

  await app.listen(port);

  console.log(`API: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/docs`);
}

await bootstrap();
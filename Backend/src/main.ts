import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser'; // ✅ safer import for Nest
import 'dotenv/config'; // ✅ load .env if not already loaded

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Cookie parser
  app.use(cookieParser());

  // ✅ Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Parse CORS origins from env (comma-separated list)
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [];
  const allowCredentials = process.env.CORS_CREDENTIALS === 'true';

  app.enableCors({
    origin: corsOrigins,
    credentials: allowCredentials,
  });

  // ✅ Global prefix from env
  const prefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(prefix);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}/${prefix}`);
}
bootstrap();

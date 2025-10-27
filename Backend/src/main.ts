import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser'; // ✅ default import
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Use cookie parser
  app.use(cookieParser());

  // ✅ Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ CORS from env
  const corsOrigin =
    process.env.CORS_ORIGIN?.replace(/^"|"$/g, '') || 'http://localhost:3001';
  const allowCredentials = process.env.CORS_CREDENTIALS === 'true';

  app.enableCors({
    origin: corsOrigin,
    credentials: allowCredentials,
  });

  // ✅ Global API prefix
  const prefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(prefix);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('🚀 Server running on:');
  console.log(`   → API:   http://localhost:${port}/${prefix}`);
  console.log(`   → CORS:  ${corsOrigin}`);
}

bootstrap();

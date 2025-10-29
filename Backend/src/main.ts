import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // ✅ Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MindVault API')
    .setDescription('Auto-generated API documentation for MindVault Backend')
    .setVersion('1.0')
    .addBearerAuth() // Enable JWT token in Swagger
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keep JWT token when refreshing
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('🚀 Server running on:');
  console.log(`   → API:   http://localhost:${port}/${prefix}`);
  console.log(`   → Docs:  http://localhost:${port}/${prefix}/docs`);
  console.log(`   → CORS:  ${corsOrigin}`);
}

bootstrap();

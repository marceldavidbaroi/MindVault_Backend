import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CommandService } from 'nestjs-command';

import 'dotenv/config';

async function bootstrap() {
  const args = process.argv.slice(2); // skip 'node' and 'ts-node'
  const isCli = args.length > 0;

  if (isCli) {
    // CLI mode (run seeders or other commands)
    const app = await NestFactory.createApplicationContext(AppModule);
    try {
      await app.get(CommandService).exec(); // runs commands like 'categories:run'
      console.log('✅ Seeder executed successfully!');
    } catch (err) {
      console.error('❌ Seeder failed:', err);
    } finally {
      await app.close();
      process.exit(0); // exit immediately after running CLI
    }
  }

  // HTTP server mode
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

  // ✅ CORS
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
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('🚀 Server running on:');
  console.log(`   → API:   http://localhost:${port}/${prefix}`);
  console.log(`   → Docs:  http://localhost:${port}/${prefix}/docs`);
  console.log(`   → CORS:  ${corsOrigin}`);
}

bootstrap();

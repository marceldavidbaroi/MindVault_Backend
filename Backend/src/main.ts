import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser'; // ✅ default import
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'http://192.168.0.105:3001',
];

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

  // ✅ Enable CORS for frontend with cookies
  // app.enableCors({
  //   origin: (origin, callback) => {
  //     // allow requests with no origin (like curl or Postman)
  //     if (!origin) return callback(null, true);

  //     if (allowedOrigins.includes(origin)) {
  //       callback(null, true); // allow this origin
  //     } else {
  //       callback(new Error('Not allowed by CORS'));
  //     }
  //   },
  //   credentials: true, // needed for cookies
  // });

  app.enableCors({
    origin: ['http://localhost:3001'], // frontend
    credentials: true, // required for cookies
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

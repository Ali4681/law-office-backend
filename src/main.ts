import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import './firebase';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true, // أو حدد الـ domains المسموحة
    credentials: true,
  });

  // Use class-validator container
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Listen on port
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  console.log(`🚀 Application is running on: http://localhost:${PORT}`);
}

bootstrap();

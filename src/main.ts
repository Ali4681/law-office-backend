import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import './firebase';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  // فقط للتطوير المحلي
  if (process.env.NODE_ENV !== 'production') {
    await app.listen(process.env.PORT || 3000);
    console.log(
      `🚀 Server running on http://localhost:${process.env.PORT || 3000}`,
    );
  }
}

bootstrap();

// هذا السطر ضروري جدًا لـ Vercel
export default server;

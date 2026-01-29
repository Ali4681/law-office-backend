import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { useContainer } from 'class-validator';
import './firebase';

const expressApp = express();

export async function createApp() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors(); // إذا كنت تحتاج CORS

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return expressApp;
}

// للتشغيل المحلي
if (process.env.NODE_ENV !== 'production') {
  createApp().then((app) => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

export default expressApp;

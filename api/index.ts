import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { useContainer } from 'class-validator';

const expressApp = express();
let isAppInitialized = false;

async function initializeApp() {
  if (isAppInitialized) return;

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  isAppInitialized = true;
}

export default async function handler(req: Request, res: Response) {
  await initializeApp();
  return expressApp(req, res);
}

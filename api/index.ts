import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { useContainer } from 'class-validator';
import type { Request, Response } from 'express';

const server = express();
let isInitialized = false;

async function initializeNestApp() {
  if (isInitialized) {
    return server;
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn', 'log'],
  });

  // Enable CORS
  app.enableCors({
    origin: true,
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

  await app.init();
  isInitialized = true;

  console.log('✅ NestJS app initialized for Vercel');

  return server;
}

export default async function handler(req: Request, res: Response) {
  try {
    const app = await initializeNestApp();
    return app(req, res);
  } catch (error) {
    console.error('❌ Error initializing NestJS:', error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
}

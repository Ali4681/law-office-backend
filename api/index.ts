import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { useContainer } from 'class-validator';

const expressApp = express();
let isAppInitialized = false;

async function initializeApp() {
  if (isAppInitialized) {
    return expressApp;
  }

  try {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: ['error', 'warn'] },
    );

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    isAppInitialized = true;
    console.log('✅ NestJS initialized');

    return expressApp;
  } catch (error) {
    console.error('❌ Failed to initialize:', error);
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  try {
    await initializeApp();
    return expressApp(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
}

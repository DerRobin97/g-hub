import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);

  // Cookies (httpOnly JWT) lesen
  app.use(cookieParser());

  // Alle Routen unter /api (Bauplan §5.1)
  app.setGlobalPrefix('api');

  // Validierung an den API-Grenzen (Bauplan §3 Backend)
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  // CORS für das getrennte Frontend (Bauplan §2)
  const frontendUrl = config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
  app.enableCors({ origin: frontendUrl, credentials: true });

  const port = Number(config.get<string>('PORT') ?? 3000);
  await app.listen(port);
  Logger.log(`G-Hub API läuft auf http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();

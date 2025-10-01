import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });

    app.useGlobalPipes(
    new ValidationPipe({
      transform: true,              // 👈 Convierte tipos automáticamente según los DTOs
      whitelist: true,              // 👈 Elimina campos que no están en los DTOs
      forbidNonWhitelisted: true,   // 👈 Lanza error si se envían campos no permitidos
    }),
  );

/*   app.use(cors()); */

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // → Archivos accesibles desde /uploads/*
  });

  await app.listen(3000);
}
bootstrap();
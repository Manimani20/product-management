import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS ──────────────────────────────────────────────────────────────────
  // Allow the Vite dev server (and any localhost port) to call this API.
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:4173', 'https://product-management.ungaralamanivardhan.workers.dev'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: false,
  });

  // ── Global Validation Pipe ─────────────────────────────────────────────────
  // - whitelist: strips properties not in the DTO
  // - forbidNonWhitelisted: rejects requests that send unknown properties
  // - transform: auto-converts plain objects to DTO class instances
  //              and coerces types (e.g. string "1" → number 1 for @Param)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Swagger ────────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Product Management API')
    .setDescription('REST APIs for managing products')
    .setVersion('1.0')
    .addTag('products', 'CRUD operations for products')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: false,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
    },
  });

  // ── Start ──────────────────────────────────────────────────────────────────
  await app.listen(3000);

  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║       Product Management API is running          ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  API Base    : http://localhost:3000              ║');
  console.log('║  Swagger UI  : http://localhost:3000/api/docs     ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
}

bootstrap();

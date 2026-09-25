import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS ──────────────────────────────────────────────────────────────────
  // Accept requests from:
  //   - local Vite dev server
  //   - any Cloudflare Workers deployment (workers.dev)
  //   - any Render frontend deployment (onrender.com)
  // Using a function so we can match patterns rather than hardcode every URL.
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      const allowed =
        origin === 'http://localhost:5173' ||
        origin === 'http://localhost:4173' ||
        origin.endsWith('.workers.dev') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.pages.dev');   // Cloudflare Pages (future-proof)

      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: false,
  });

  // ── Global Validation Pipe ─────────────────────────────────────────────────
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
  // Render injects PORT at runtime — fall back to 3000 for local dev.
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log('');
  console.log(`Application is running on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
  console.log('');
}

bootstrap();

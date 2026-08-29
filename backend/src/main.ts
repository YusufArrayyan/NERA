import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  // app.use(helmet()); // Disabled for local testing
  app.use(compression());
  app.use(cookieParser());

  // CORS - Must be before routes
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://nera-learning.vercel.app',
        'https://nera-cdhy.onrender.com',
      ];
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-JSON-Response-Body'],
    maxAge: 3600,
    preflightContinue: false,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Neuro-Adaptive Cloud Learning API')
    .setDescription('EEG-based Adaptive Learning Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('eeg', 'EEG data & simulator')
    .addTag('sessions', 'Learning sessions')
    .addTag('learning', 'Learning content')
    .addTag('gamification', 'Gamification system')
    .addTag('analytics', 'Analytics & reports')
    .addTag('notifications', 'Notification system')
    .addTag('interventions', 'Teacher/Counselor interventions')
    .addTag('admin', 'Administration')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🧠 Neuro-Adaptive API running on port ${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}
bootstrap();

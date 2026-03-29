import './env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'http://196.189.237.3:8080',
      'http://196.189.237.3:3001',
      'http://196.189.237.3:3002'
    ],// Allows all origins (easiest for testing)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();

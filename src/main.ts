import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita o CORS (para o frontend na porta 3000 poder chamar)
  app.enableCors();

  // Habilita a validação automática de todos os DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Roda o backend na porta 3001
  await app.listen(3001);
  console.log(`Backend rodando em http://localhost:3001`);
}
bootstrap();
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CarrinhoModule } from './carrinho/carrinho.module';
import { TrajetoModule } from './trajeto/trajeto.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule,
    CarrinhoModule,
    TrajetoModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

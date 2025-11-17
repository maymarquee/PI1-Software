import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CarrinhoModule } from './carrinho/carrinho.module';
import { TrajetoModule } from './trajeto/trajeto.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [HttpModule, CarrinhoModule, TrajetoModule],
  providers: [PrismaService],
})
export class AppModule {}

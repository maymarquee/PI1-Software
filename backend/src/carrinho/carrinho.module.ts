import { Module } from '@nestjs/common';
import { CarrinhoController } from './carrinho.controller';
import { CarrinhoService } from './carrinho.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../../prisma/prisma.module';
import { TrajetoModule } from '../trajeto/trajeto.module';
import { SensorModule } from '../sensors/sensor.module';

@Module({
  imports: [HttpModule, TrajetoModule, PrismaModule, SensorModule],
  controllers: [CarrinhoController],
  providers: [CarrinhoService],
})
export class CarrinhoModule {}
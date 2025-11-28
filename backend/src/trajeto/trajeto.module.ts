import { Module } from '@nestjs/common';
import { TrajetoService } from './trajeto.service';
import { TrajetoController } from './trajeto.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TrajetoController],
  providers: [TrajetoService, PrismaService],
  exports: [TrajetoService],
})
export class TrajetoModule {}
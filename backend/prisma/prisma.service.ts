import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Conectado ao banco de dados com Prisma');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Conexão com o banco de dados encerrada');
  }
}

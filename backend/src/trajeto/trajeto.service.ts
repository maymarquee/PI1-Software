import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExecutarTrajetoDto } from '../dtos/executar-trajeto.dto';

@Injectable()
export class TrajetoService {
  constructor(private prisma: PrismaService) {}

  async salvarTrajeto(dto: ExecutarTrajetoDto) {
    // Cria um trajeto com seus comandos associados
    return await this.prisma.trajeto.create({
      data: {
        comandos: {
          create: dto.comandos.map(c => ({
            acao: c.acao,
            valor: c.valor,
            direcao: c.direcao,
          })),
        },
      },
      include: {
        comandos: true,
      },
    });
  }

  async listarTrajetos() {
    return this.prisma.trajeto.findMany({
      include: { comandos: true },
      orderBy: { criadoEm: 'desc' },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
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
      orderBy: { dataExecucao: 'desc' },
    });
  }
  
  async toggleFavorito(id: number) {
    // Primeiro, busca o trajeto para ver o estado atual
    const trajeto = await this.prisma.trajeto.findUnique({
      where: { id },
      select: { isFavorito: true },
    });

    if (!trajeto) {
      throw new NotFoundException(`Trajeto com ID ${id} não encontrado.`);
    }

    // Inverte o valor
    const novoEstado = !trajeto.isFavorito;

    // Atualiza no banco
    return this.prisma.trajeto.update({
      where: { id },
      data: { isFavorito: novoEstado },
    });
  }
}

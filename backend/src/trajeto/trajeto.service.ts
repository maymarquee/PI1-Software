import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExecutarTrajetoDto } from '../dtos/executar-trajeto.dto';
import { StatusRealtimeDto } from 'src/dtos/status-realtime.dto';

@Injectable()
export class TrajetoService {
  constructor(private prisma: PrismaService) {}
  private filaDeFeedback: StatusRealtimeDto[] = [];
  private idTrajetoAtual: number | null = null;

  async receberFeedbackDoCarrinho(dto: StatusRealtimeDto) {
        
    // se não tivermos um trajeto rodando, ignoramos ou avisamos
    if (!this.idTrajetoAtual) {
        console.warn("[Aviso] Feedback recebido, mas nenhum trajeto está ativo.");
        return { status: 'ignorado' };
    }

    const dadosComId = { ...dto, trajetoId: this.idTrajetoAtual };

    console.log(`[Backend] Feedback (Trajeto #${this.idTrajetoAtual}):`, dto);
    
    // memória
    this.filaDeFeedback.push(dadosComId);

    // banco
    await this.prisma.logSegmento.create({
        data: {
            trajetoId: this.idTrajetoAtual, 
            distancia: dto.distancia || null,
            angulo: dto.angulo || null,
            velocidadeMedia: dto.velocidade || 0
        }
    });
    
    return { status: 'recebido' };
  }

  // chamado pelo Frontend (GET Polling)
  entregarFeedbackParaFrontend() {
    // pega tudo o que chegou
    const dadosParaEntregar = [...this.filaDeFeedback];
    
    // limpa a fila para não mandar repetido na próxima vez
    this.filaDeFeedback = [];
    
    return dadosParaEntregar;
  }

  async salvarTrajeto(dto: ExecutarTrajetoDto) {
    // cria um trajeto com seus comandos associados
   const trajetoCriado = await this.prisma.trajeto.create({
      data: {
        nome: dto.nome,
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
    this.idTrajetoAtual = trajetoCriado.id;
    console.log(`[TrajetoService] Novo trajeto iniciado. ID Atual: ${this.idTrajetoAtual}`);

    return trajetoCriado;
  }

  async listarTrajetos() {
    return this.prisma.trajeto.findMany({
      include: { comandos: true, logsSegmento: { orderBy: { criadoEm: 'asc' } } },
      orderBy: { dataExecucao: 'desc' },
    });
  }
  
  async toggleFavorito(id: number) {
    // busca o trajeto para ver o estado atual
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

  async excluir(id: number) {
    return await this.prisma.trajeto.delete({
      where: { id },
    });
  }
}

import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ExecutarTrajetoDto } from 'src/dtos/executar-trajeto.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { ComandoDto } from 'src/dtos/comando.dto';

@Injectable()
export class CarrinhoService {
  // 👇 **LEMBRE-SE DE VERIFICAR SEU IP AQUI** 👇
  private readonly IP_CARRINHO = 'http://192.168.1.105'; // SEU IP REAL

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  private _calcularMetricas(comandos: ComandoDto[]): {
    distanciaTotal: number;
    tempoTotalEstimado: number;
    velocidadeMedia: number;
  } {
    const MS_POR_CM = 100;
    const MS_POR_ROTACAO = 1000;
    let distanciaTotal = 0;
    let tempoTotalEstimadoMs = 0;

    for (const cmd of comandos) {
      if (cmd.acao === 'frente' && cmd.valor) {
        distanciaTotal += cmd.valor;
        tempoTotalEstimadoMs += cmd.valor * MS_POR_CM;
      } else if (cmd.acao === 'rotacionar') {
        tempoTotalEstimadoMs += MS_POR_ROTACAO;
      }
    }
    const tempoTotalEstimado = tempoTotalEstimadoMs / 1000.0;
    const velocidadeMedia =
      tempoTotalEstimado > 0 ? distanciaTotal / tempoTotalEstimado : 0;

    return {
      distanciaTotal: parseFloat(distanciaTotal.toFixed(2)),
      tempoTotalEstimado: parseFloat(tempoTotalEstimado.toFixed(2)),
      velocidadeMedia: parseFloat(velocidadeMedia.toFixed(2)),
    };
  }

  async executar(trajetoDto: ExecutarTrajetoDto) {
    console.log(`[CarrinhoService] Repassando para ESP32:`, trajetoDto);
    const metricas = this._calcularMetricas(trajetoDto.comandos);
    console.log('[CarrinhoService] Métricas Calculadas:', metricas);

    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post(`${this.IP_CARRINHO}/trajeto`, trajetoDto, { timeout: 5000 })
          .pipe(
            catchError((error) => {
              console.error(
                'Erro ao comunicar com o carrinho:',
                error.message,
              );
              throw new InternalServerErrorException(
                'Não foi possível conectar ao carrinho.',
              );
            }),
          ),
      );

      const trajetoSalvo = await this.salvarNoBanco({
        comandos: trajetoDto.comandos,
        respostaCarrinho: data,
        dataExecucao: new Date(),
        nome: trajetoDto.nome,
        ...metricas,
      });

      return { status: 'enviado', respostaCarrinho: data, trajetoSalvo };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private async salvarNoBanco(dados: any) {
    try {
      return await this.prisma.trajeto.create({
        data: {
          dataExecucao: dados.dataExecucao,
          respostaCarrinho: dados.respostaCarrinho,
          distanciaTotal: dados.distanciaTotal,
          tempoTotalEstimado: dados.tempoTotalEstimado,
          velocidadeMedia: dados.velocidadeMedia,
          nome: dados.nome,
          comandos: {
            create: dados.comandos.map((cmd) => ({
              acao: cmd.acao,
              valor: cmd.valor,
              direcao: cmd.direcao,
            })),
          },
        },
        include: { comandos: true },
      });
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private handleDatabaseError(error: any) {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new BadRequestException('Registro duplicado.');
        case 'P2003':
          throw new BadRequestException('Violação de chave estrangeira.');
        case 'P2025':
          throw new BadRequestException('Registro não encontrado.');
        default:
          console.error('Erro Prisma desconhecido:', error);
          throw new InternalServerErrorException(
            'Erro desconhecido no banco de dados.',
          );
      }
    } else if (error instanceof InternalServerErrorException) {
      throw error;
    }
    console.error('Erro inesperado ao salvar no banco:', error);
    throw new InternalServerErrorException(
      'Falha ao salvar os dados no banco.',
    );
  }

  async interruptar() {
    console.log(
      `[CarrinhoService] Enviando comando de PARADA para o ESP32...`,
    );
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post(`${this.IP_CARRINHO}/interruptar`, {}, { timeout: 3000 })
          .pipe(
            catchError((error) => {
              console.error('Erro ao enviar comando de parada:', error.message);
              throw new InternalServerErrorException(
                'Não foi possível parar o carrinho.',
              );
            }),
          ),
      );
      return { status: 'parada_enviada', respostaCarrinho: data };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.handleDatabaseError(error);
    }
  }

  // --- ADICIONE ESTAS DUAS NOVAS FUNÇÕES ---
  /**
   * Envia comando para ABRIR A PORTA do ESP32
   */
  async abrirPorta() {
    console.log(
      `[CarrinhoService] Enviando comando para ABRIR PORTA ao ESP32...`,
    );
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post(`${this.IP_CARRINHO}/abrirPorta`, {}, { timeout: 3000 })
          .pipe(
            catchError((error) => {
              console.error('Erro ao ABRIR PORTA:', error.message);
              throw new InternalServerErrorException(
                'Não foi possível abrir a porta do carrinho.',
              );
            }),
          ),
      );
      return { status: 'porta_aberta', respostaCarrinho: data };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.handleDatabaseError(error);
    }
  }

  /**
   * Envia comando para FECHAR A PORTA do ESP32
   */
  async fecharPorta() {
    console.log(
      `[CarrinhoService] Enviando comando para FECHAR PORTA ao ESP32...`,
    );
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post(`${this.IP_CARRINHO}/fecharPorta`, {}, { timeout: 3000 })
          .pipe(
            catchError((error) => {
              console.error('Erro ao FECHAR PORTA:', error.message);
              throw new InternalServerErrorException(
                'Não foi possível fechar a porta do carrinho.',
              );
            }),
          ),
      );
      return { status: 'porta_fechada', respostaCarrinho: data };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.handleDatabaseError(error);
    }
  }
  // --- FIM ---
}
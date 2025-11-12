import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ExecutarTrajetoDto } from 'src/dtos/executar-trajeto.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // ✅ import correto
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CarrinhoService {
  // ** TROQUE ESTE IP PELO IP REAL DO SEU ESP32 **
  private readonly URL_CARRINHO = 'http://localhost:4000/trajeto';

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService, // injeção do Prisma
  ) {}

  /**
   * Função para detectar e tratar erros de banco de dados
   */
  private handleDatabaseError(error: any) {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new BadRequestException('Registro duplicado. Já existe um item com este valor único.');
        case 'P2003':
          throw new BadRequestException('Violação de chave estrangeira. Verifique as relações.');
        case 'P2025':
          throw new BadRequestException('Registro não encontrado para atualização ou exclusão.');
        default:
          console.error('Erro Prisma desconhecido:', error);
          throw new InternalServerErrorException('Erro desconhecido no banco de dados.');
      }
    }

    console.error('Erro inesperado ao salvar no banco:', error);
    throw new InternalServerErrorException('Falha ao salvar os dados no banco.');
  }

  /**
   * Salva no banco os dados do trajeto executado
   */
  private async salvarNoBanco(dados: any) {
  try {
    return await this.prisma.trajeto.create({
      data: {
        dataExecucao: dados.dataExecucao,
        respostaCarrinho: dados.respostaCarrinho,
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

  /**
   * Envia o trajeto para o ESP32 e salva no banco
   */
  async executar(trajetoDto: ExecutarTrajetoDto) {
    console.log(`[CarrinhoService] Repassando para ESP32:`, trajetoDto);

    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post(this.URL_CARRINHO, trajetoDto, { timeout: 5000 })
          .pipe(
            catchError((error) => {
              console.error('Erro ao comunicar com o carrinho:', error.message);
              throw new InternalServerErrorException('Não foi possível conectar ao carrinho.');
            }),
          ),
      );

      const trajetoSalvo = await this.salvarNoBanco({
        comandos: trajetoDto.comandos,
        respostaCarrinho: data,
        dataExecucao: new Date(),
      });

      return { status: 'enviado', respostaCarrinho: data, trajetoSalvo };

    } catch (error) {
      this.handleDatabaseError(error);
    }
  }
}

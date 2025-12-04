import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ExecutarTrajetoDto } from 'src/dtos/executar-trajeto.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { TrajetoService } from '../trajeto/trajeto.service';
import { SensorService } from '../sensors/sensor.service';

@Injectable()
export class CarrinhoService {
  private readonly IP_CARRINHO = 'http://192.168.47.216';

  constructor(
    private readonly httpService: HttpService,
    private readonly trajetoService: TrajetoService,
    private readonly sensorService: SensorService,
  ) {}

  async executar(trajetoDto: ExecutarTrajetoDto) {
    console.log(`[CarrinhoService] Iniciando nova execução...`);

    // Verificação pré-execução: sensores
    try {
      // const trajetoSalvo = await this.trajetoService.salvarTrajeto(trajetoDto);
      // const idParaOEsp = trajetoSalvo.id;
      // console.log(
      //   `[CarrinhoService] Trajeto criado no banco com ID: ${idParaOEsp}`,
      // );
      // const payloadParaCarrinho = {
      //   comandos: trajetoDto.comandos,
      // };
      // console.log('⚠️ MODO TESTE: Simulando resposta positiva do carrinho...');
      // const data = { status: 'recebido', mensagem: 'Simulação de teste' };
      // return { status: 'enviado', runId: idParaOEsp, respostaCarrinho: data };

      const precheck = await this.sensorService.verificarTodos();
      if (precheck.status === 'falha') {
        console.error(
          '[CarrinhoService] Pre-check dos sensores falhou:',
          precheck.sensores,
        );
        throw new InternalServerErrorException(
          'Pre-check dos sensores falhou.',
        );
      }
    } catch (err) {
      console.error(
        '[CarrinhoService] Erro durante pre-check:',
        err?.message || err,
      );
      throw new InternalServerErrorException('Erro no pre-check dos sensores.');
    }

    const trajetoSalvo = await this.trajetoService.salvarTrajeto(trajetoDto);

    const idParaOEsp = trajetoSalvo.id;
    console.log(
      `[CarrinhoService] Trajeto criado no banco com ID: ${idParaOEsp}`,
    );

    const payloadParaCarrinho = {
      comandos: trajetoDto.comandos,
    };

    try {
      console.log(
        `[CarrinhoService] Enviando para ESP32 (ID: ${idParaOEsp})...`,
      );

      const { data } = await firstValueFrom(
        this.httpService
          .post(`${this.IP_CARRINHO}/trajeto`, payloadParaCarrinho, {
            timeout: 5000,
          })
          .pipe(
            catchError((error) => {
              console.error('Erro ao comunicar com o carrinho:', error.message);
              throw new InternalServerErrorException(
                'Não foi possível conectar ao carrinho.',
              );
            }),
          ),
      );

      return { status: 'enviado', runId: idParaOEsp, respostaCarrinho: data };
    } catch (error) {
      this.handleError(error);
    }
  }

  async interruptar() {
    return this.enviarComandoSimples('interruptar');
  }

  async abrirPorta() {
    return this.enviarComandoSimples('abrirPorta');
  }

  async fecharPorta() {
    return this.enviarComandoSimples('fecharPorta');
  }

  private async enviarComandoSimples(endpoint: string) {
    console.log(`[CarrinhoService] Enviando comando: ${endpoint}...`);
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post(`${this.IP_CARRINHO}/${endpoint}`, {}, { timeout: 3000 })
          .pipe(
            catchError((error) => {
              console.error(`Erro em /${endpoint}:`, error.message);
              throw new InternalServerErrorException(
                `Falha ao chamar ${endpoint}.`,
              );
            }),
          ),
      );
      return { status: 'sucesso', comando: endpoint, resposta: data };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof InternalServerErrorException) {
      throw error;
    }
    console.error('Erro inesperado:', error);
    throw new InternalServerErrorException('Erro interno no servidor.');
  }
}

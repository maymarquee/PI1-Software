import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ExecutarTrajetoDto } from 'src/dtos/executar-trajeto.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { TrajetoService } from '../trajeto/trajeto.service'; // Importação correta

@Injectable()
export class CarrinhoService {
  // IP ESP32
  private readonly IP_CARRINHO = 'http://192.168.120.216';

  constructor(
    private readonly httpService: HttpService,
    private readonly trajetoService: TrajetoService, // Injeção do TrajetoService
  ) {}

  async executar(trajetoDto: ExecutarTrajetoDto) {
    console.log(`[CarrinhoService] Iniciando nova execução...`);

    // Salva o planejamento no banco via TrajetoService
    // O banco cria o registro, define status como "executando" e gera o ID numérico.
    const trajetoSalvo = await this.trajetoService.salvarTrajeto(trajetoDto);
    
    // Pega o ID que o banco gerou (ex: 15)
    const idParaOEsp = trajetoSalvo.id;
    console.log(`[CarrinhoService] Trajeto criado no banco com ID: ${idParaOEsp}`);

    // Prepara o pacote para o ESP32
    // O ESP32 precisa desse ID para enviar os feedbacks depois
    const payloadParaCarrinho = {
      runId: idParaOEsp, 
      comandos: trajetoDto.comandos,
    };

    try {
      //  TESTE (SIMULAÇÃO) - Descomentar para testar requisições carrinho -> back sem ESP32
      
      console.log("⚠️ MODO TESTE: Simulando resposta positiva do carrinho...");
      const data = { status: "recebido", mensagem: "Simulação de teste" };
      return { status: 'enviado', runId: idParaOEsp, respostaCarrinho: data };
      
      // _____

      console.log(`[CarrinhoService] Enviando para ESP32 (ID: ${idParaOEsp})...`);
      /*
      const { data } = await firstValueFrom(
        this.httpService
          .post(`${this.IP_CARRINHO}/trajeto`, payloadParaCarrinho, { timeout: 5000 })
          .pipe(
            catchError((error) => {
              console.error('Erro ao comunicar com o carrinho:', error.message);
              throw new InternalServerErrorException('Não foi possível conectar ao carrinho.');
            }),
          ),
      );

      // Retorna sucesso e o ID para o frontend saber o que monitorar
      return { status: 'enviado', runId: idParaOEsp, respostaCarrinho: data };*/

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

  // Helper para enviar comandos simples sem payload
  private async enviarComandoSimples(endpoint: string) {
    console.log(`[CarrinhoService] Enviando comando: ${endpoint}...`);
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post(`${this.IP_CARRINHO}/${endpoint}`, {}, { timeout: 3000 })
          .pipe(
            catchError((error) => {
              console.error(`Erro em /${endpoint}:`, error.message);
              throw new InternalServerErrorException(`Falha ao chamar ${endpoint}.`);
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
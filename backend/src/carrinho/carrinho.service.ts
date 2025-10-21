import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ExecutarTrajetoDto } from 'src/dtos/executar-trajeto.dto';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class CarrinhoService {
  // ** TROQUE ESTE IP PELO IP REAL DO SEU ESP32 **
  private readonly URL_CARRINHO = 'http://localhost:4000/trajeto';

  constructor(private readonly httpService: HttpService) {}

  async executar(trajetoDto: ExecutarTrajetoDto) {
    console.log(`[CarrinhoService] Repassando para ESP32:`, trajetoDto);

    try {
      // Repassa o DTO de comandos diretamente para o ESP32
      const { data } = await firstValueFrom(
        this.httpService.post(this.URL_CARRINHO, trajetoDto, { timeout: 5000 })
        .pipe(
          catchError((error) => {
            console.error('Erro ao comunicar com o carrinho:', error.message);
            throw new InternalServerErrorException('Não foi possível conectar ao carrinho.');
          }),
        ),
      );

      // Retorna a resposta do carrinho diretamente para o FRONTEND
      return { status: 'enviado', respostaCarrinho: data };

    } catch (error) {
      throw error; // Lança o erro para o frontend saber que falhou
    }
  }
}
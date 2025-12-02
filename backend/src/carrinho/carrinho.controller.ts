import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CarrinhoService } from './carrinho.service';
import { ExecutarTrajetoDto } from 'src/dtos/executar-trajeto.dto';

@Controller('carrinho')
export class CarrinhoController {
  constructor(private readonly carrinhoService: CarrinhoService) {}

  // Rota para o FRONTEND iniciar um trajeto
  @Post('executar')
  executarTrajeto(@Body() trajetoDto: ExecutarTrajetoDto) {
    console.log(trajetoDto);
    return this.carrinhoService.executar(trajetoDto);
  }

  // Rota para o FRONTEND interromper um trajeto
  @Post('interruptar')
  @HttpCode(HttpStatus.OK)
  async interruptarTrajeto() {
    console.log('Recebida requisição para INTERROMPER');
    return this.carrinhoService.interruptar();
  }

  @Post('abrir-porta')
  @HttpCode(HttpStatus.OK)
  async abrirPorta() {
    console.log('Recebida requisição para ABRIR PORTA');
    return this.carrinhoService.abrirPorta();
  }

  @Post('fechar-porta')
  @HttpCode(HttpStatus.OK)
  async fecharPorta() {
    console.log('Recebida requisição para FECHAR PORTA');
    return this.carrinhoService.fecharPorta();
  }
}
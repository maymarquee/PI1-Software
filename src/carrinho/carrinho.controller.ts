import { Controller, Post, Body } from '@nestjs/common';
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
}
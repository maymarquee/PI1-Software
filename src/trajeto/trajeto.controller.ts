import { Body, Controller, Get, Post } from '@nestjs/common';
import { TrajetoService } from './trajeto.service';
import { ExecutarTrajetoDto } from '../dtos/executar-trajeto.dto';

@Controller('trajetos')
export class TrajetoController {
  constructor(private readonly trajetoService: TrajetoService) {}

  @Post()
  async criar(@Body() dto: ExecutarTrajetoDto) {
    const trajeto = await this.trajetoService.salvarTrajeto(dto);
    return { message: 'Trajeto salvo com sucesso!', trajeto };
  }

  @Get()
  async listar() {
    const trajetos = await this.trajetoService.listarTrajetos();
    return trajetos;
  }
}

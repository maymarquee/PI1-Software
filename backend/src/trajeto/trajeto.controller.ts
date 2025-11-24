import { Body, Controller, Get, Post, Patch, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { TrajetoService } from './trajeto.service';
import { ExecutarTrajetoDto } from '../dtos/executar-trajeto.dto';
import { StatusRealtimeDto } from 'src/dtos/status-realtime.dto';

@Controller('trajetos')
export class TrajetoController {
  constructor(private readonly trajetoService: TrajetoService) { }
  @Post('feedback')
  receber(@Body() dto: StatusRealtimeDto) {
    return this.trajetoService.receberFeedbackDoCarrinho(dto);
  }

  @Get('feedback')
  entregar() {
    return this.trajetoService.entregarFeedbackParaFrontend();
  }

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

  @Patch(':id/favorito')
  @HttpCode(HttpStatus.OK)
  async toggleFavorito(@Param('id', ParseIntPipe) id: number) {
    return this.trajetoService.toggleFavorito(id);
  }
}

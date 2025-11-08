import { IsString, IsIn, IsNumber, IsOptional, ValidateNested } from 'class-validator';

export class ComandoDto {
  @IsString()
  @IsIn(['frente', 'rotacionar'])
  acao: string;

  @IsNumber()
  @IsOptional()
  valor?: number;

  @IsString()
  @IsIn(['esquerda', 'direita'])
  @IsOptional()
  direcao?: string;
}
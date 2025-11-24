import { IsNumber, IsOptional } from 'class-validator';

export class StatusRealtimeDto {
  @IsNumber()
  @IsOptional()
  distancia?: number; 

  @IsNumber()
  @IsOptional()
  angulo?: number;   

  @IsNumber()
  @IsOptional()
  velocidade?: number;
}
import { IsArray,  IsOptional,  IsString,  ValidateNested} from "class-validator";
import { Type } from 'class-transformer';
import { ComandoDto } from './comando.dto';

export class ExecutarTrajetoDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ComandoDto)
    comandos: ComandoDto[];

    @IsString()
    @IsOptional()
    nome?: string;
}
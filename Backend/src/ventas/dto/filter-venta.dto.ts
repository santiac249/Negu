import { IsOptional, IsNumber, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterVentaDto {
  @IsNumber()
  @IsOptional()
  clienteId?: number;

  @IsNumber()
  @IsOptional()
  usuarioId?: number;

  @IsNumber()
  @IsOptional()
  metPagoId?: number;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fechaInicio?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fechaFin?: Date;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}

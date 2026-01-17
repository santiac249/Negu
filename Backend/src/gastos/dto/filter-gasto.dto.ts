import { IsOptional, IsNumber, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterGastoDto {
  @IsNumber()
  @IsOptional()
  usuarioId?: number;

  @IsNumber()
  @IsOptional()
  proveedorId?: number;

  @IsString()
  @IsOptional()
  concepto?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

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

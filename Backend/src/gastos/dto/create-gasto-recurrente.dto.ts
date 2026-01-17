import { IsString, IsNumber, IsOptional, IsIn, Min, Length, IsDateString, Max } from 'class-validator';

export class CreateGastoRecurrenteDto {
  @IsString()
  @Length(3, 255)
  concepto: string;

  @IsNumber()
  @Min(0.01)
  monto: number;

  @IsIn(['SEMANAL', 'BISEMANAL', 'MENSUAL', 'ANUAL'])
  frecuencia: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  dia_del_mes?: number; // Solo para frecuencia MENSUAL

  @IsDateString()
  fecha_inicio: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsNumber()
  proveedorId?: number;
}
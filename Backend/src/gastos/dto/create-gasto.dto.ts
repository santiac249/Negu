// src/gastos/dto/create-gasto.dto.ts
import { IsString, IsNumber, IsOptional, IsIn, Min, Length } from 'class-validator';

export class CreateGastoDto {
  @IsString()
  @Length(3, 255, { message: 'El concepto debe tener entre 3 y 255 caracteres' })
  concepto: string;

  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  monto: number;

  @IsIn(['OPERACIONAL', 'MANTENIMIENTO'], { message: 'El tipo debe ser OPERACIONAL o MANTENIMIENTO' })
  tipo: string;

  @IsOptional()
  @IsNumber()
  proveedorId?: number;
}

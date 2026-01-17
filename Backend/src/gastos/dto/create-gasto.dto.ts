import { IsString, IsNumber, IsPositive, IsOptional, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGastoDto {
  @IsNumber()
  @IsNotEmpty()
  usuarioId: number;

  @IsNumber()
  @IsOptional()
  proveedorId?: number;

  @IsString()
  @IsNotEmpty()
  concepto: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  monto: number;

  @IsString()
  @IsNotEmpty()
  tipo: string; // 'Operativo', 'Administrativo', 'Marketing', etc.

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fecha?: Date;
}

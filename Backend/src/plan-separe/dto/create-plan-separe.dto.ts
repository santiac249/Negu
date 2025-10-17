import {
  IsNotEmpty,
  IsInt,
  ValidateNested,
  ArrayNotEmpty,
  Min,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

class PlanSepareProductoDto {
  @IsNotEmpty({ message: 'El ID del stock es obligatorio' })
  @IsInt({ message: 'El ID del stock debe ser un número entero' })
  @Transform(({ value }) => parseInt(value))
  stockId: number;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  @Transform(({ value }) => parseInt(value))
  cantidad: number;
}

enum EstadoPlanSepare {
  ACTIVO = 'Activo',
  INCUMPLIDO = 'Incumplido',
  ANULADO = 'Anulado',
  FINALIZADO = 'Finalizado'
}

export class CreatePlanSepareDto {
  @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
  @IsInt({ message: 'El ID del cliente debe ser un número entero' })
  @Transform(({ value }) => parseInt(value))
  clienteId: number;

  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @Transform(({ value }) => parseInt(value))
  usuarioId: number;

  @ArrayNotEmpty({ message: 'Debe incluir al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => PlanSepareProductoDto)
  productos: PlanSepareProductoDto[];

  @IsNotEmpty({ message: 'La deuda inicial es obligatoria' })
  @IsNumber({}, { message: 'La deuda inicial debe ser un número' })
  @Min(0.01, { message: 'La deuda inicial debe ser mayor a 0' })
  @Transform(({ value }) => parseFloat(value))
  deudaInicial: number;

  @IsNotEmpty({ message: 'La deuda parcial es obligatoria' })
  @IsNumber({}, { message: 'La deuda parcial debe ser un número' })
  @Min(0, { message: 'La deuda parcial no puede ser negativa' })
  @Transform(({ value }) => parseFloat(value))
  deudaParcial: number;

  @IsOptional()
  @IsEnum(EstadoPlanSepare, { message: 'Estado inválido' })
  estado?: EstadoPlanSepare;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha de vencimiento inválida' })
  fechaVencimiento?: string;
}
import { IsNotEmpty, IsNumber, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateAbonoPlanSepareDto {
  @IsNotEmpty({ message: 'El ID del plan separe es obligatorio' })
  @IsInt({ message: 'El ID del plan separe debe ser un número entero' })
  planSepareId: number;

  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  usuarioId: number;

  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  monto: number;

  @IsOptional()
  @IsString({ message: 'El concepto debe ser texto' })
  concepto?: string;
}
import {
  IsNotEmpty,
  IsInt,
  ValidateNested,
  ArrayNotEmpty,
  Min,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class PlanSepareProductoDto {
  @IsNotEmpty()
  @IsInt()
  stockId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreatePlanSepareDto {
  @IsNotEmpty()
  @IsInt()
  clienteId: number;

  @IsNotEmpty()
  @IsInt()
  usuarioId: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PlanSepareProductoDto)
  productos: PlanSepareProductoDto[];

  @IsNotEmpty()
  deudaInicial: number;

  @IsNotEmpty()
  deudaParcial: number;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsNumber()
  porcentajePagado?: number;
}
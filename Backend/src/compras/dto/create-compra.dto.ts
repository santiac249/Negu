import { IsNotEmpty, IsInt, IsDateString, ValidateNested, ArrayNotEmpty, Min, IsPositive, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class DetalleCompraDto {
  @IsNotEmpty()
  @IsInt()
  productoId: number;

  @IsOptional()
  @IsInt()
  colorId?: number;

  @IsOptional()
  @IsInt()
  tallaId?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cantidad: number;

  @IsNotEmpty()
  @IsPositive()
  precio_compra: number;
}

export class CreateCompraDto {
  @IsNotEmpty()
  @IsInt()
  proveedorId: number;

  @IsNotEmpty()
  @IsInt()
  usuarioId: number;

  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DetalleCompraDto)
  detalles: DetalleCompraDto[];
}
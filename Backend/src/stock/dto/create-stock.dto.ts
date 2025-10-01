import { IsNotEmpty, IsInt, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateStockDto {
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
  @IsNumber()
  @Min(0)
  precio_compra: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precio_venta: number;

  @IsNotEmpty()
  @IsInt()
  cantidad: number;
}
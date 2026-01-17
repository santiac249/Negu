import { IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class CreateDetalleVentaDto {
  @IsNumber()
  @IsNotEmpty()
  stockId: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  cantidad: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  precio: number; // Precio unitario de venta
}

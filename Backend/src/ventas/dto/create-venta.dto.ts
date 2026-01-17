import { IsNumber, IsOptional, IsDate, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDetalleVentaDto } from './create-detalle-venta.dto';

export class CreateVentaDto {
  @IsNumber()
  @IsNotEmpty()
  usuarioId: number;

  @IsNumber()
  @IsOptional()
  clienteId?: number;

  @IsNumber()
  @IsNotEmpty()
  metPagoId: number;

  @IsNumber()
  @IsOptional()
  descuento?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fecha?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleVentaDto)
  @IsNotEmpty()
  detalles: CreateDetalleVentaDto[];
}

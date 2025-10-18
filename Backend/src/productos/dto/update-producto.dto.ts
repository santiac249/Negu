import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoDto } from './create-producto.dto';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {
  @IsOptional()
  @IsArray({ message: 'subcategoriaIds debe ser un array' })
  @IsInt({ each: true, message: 'Cada subcategoriaId debe ser un número entero' })
  @Type(() => Number)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  subcategoriaIds?: number[];
}
import { PartialType } from '@nestjs/mapped-types';
import { CreateSubcategoriaDto } from './create-subcategoria.dto';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateSubcategoriaDto extends PartialType(CreateSubcategoriaDto) {
  @IsOptional()
  @IsArray({ message: 'categoriaIds debe ser un array' })
  @IsInt({ each: true, message: 'Cada categoriaId debe ser un número entero' })
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
  categoriaIds?: number[];
}
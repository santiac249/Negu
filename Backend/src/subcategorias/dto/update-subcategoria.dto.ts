import { PartialType } from '@nestjs/mapped-types';
import { CreateSubcategoriaDto } from './create-subcategoria.dto';
import { IsOptional, IsArray, ArrayNotEmpty, ArrayUnique, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateSubcategoriaDto extends PartialType(CreateSubcategoriaDto) {
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @Transform(({ value }) =>
    value === undefined
      ? undefined
      : Array.isArray(value)
      ? value.map((v) => Number(v))
      : [Number(value)]
  )
  categoriaIds?: number[];
}

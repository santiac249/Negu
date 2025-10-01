import { IsNotEmpty, IsString, IsOptional, IsArray, ArrayNotEmpty, ArrayUnique, IsInt } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateSubcategoriaDto {
  @IsNotEmpty()
  @IsString()
  subcategoria: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v) => Number(v))
      : [Number(value)]
  )
  categoriaIds: number[];
}

import { IsNotEmpty, IsString, IsOptional, IsInt, IsArray, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductoDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  marca_id: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v) => Number(v))
      : [Number(value)]
  )
  subcategoriaIds: number[];

  @IsOptional()
  @IsString()
  foto?: string;
}
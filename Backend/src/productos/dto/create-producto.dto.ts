import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsArray, 
  ArrayNotEmpty,
  IsInt,
  MaxLength, 
  MinLength 
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductoDto {
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  @Transform(({ value }) => value?.trim())
  descripcion?: string;

  @IsNotEmpty({ message: 'La marca es obligatoria' })
  @IsInt({ message: 'marca_id debe ser un número entero' })
  @Type(() => Number)
  marca_id: number;

  @IsOptional()
  @IsString()
  foto?: string;

  // IDs de subcategorías padres (M:N)
  @IsArray({ message: 'subcategoriaIds debe ser un array' })
  @ArrayNotEmpty({ message: 'Debe seleccionar al menos una subcategoría' })
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
  subcategoriaIds: number[];
}
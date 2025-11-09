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
  @Transform(({ value }) => {
    if (!value) return [];
    // Si viene como string tipo '[3,5]' o '4'
    if (typeof value === 'string') {
      if (value.startsWith('[')) {
        try {
          const arr = JSON.parse(value);
          return Array.isArray(arr) ? arr.map(Number) : [Number(arr)];
        } catch {
          return [Number(value)];
        }
      }
      // caso simple: '5'
      return [Number(value)];
    }
    // Si viene como array tipo ['5','6']
    if (Array.isArray(value)) {
      return value.map((v) => Number(v));
    }
    return [];
  })
  @IsArray({ message: 'subcategoriaIds debe ser un array' })
  @ArrayNotEmpty({ message: 'Debe seleccionar al menos una subcategoría' })
  @IsInt({ each: true, message: 'Cada subcategoriaId debe ser un número entero' })
  subcategoriaIds: number[];
}

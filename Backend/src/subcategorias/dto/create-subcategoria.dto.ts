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

export class CreateSubcategoriaDto {
  @IsNotEmpty({ message: 'El nombre de la subcategoría es obligatorio' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  subcategoria: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  descripcion?: string;

  @IsOptional()
  @IsString()
  foto?: string;

  // ✅ IDs de categorías padres (M:N)
  @Transform(({ value }) => {
    if (!value) return [];

    // Si viene como string tipo "[1,2]" o "1"
    if (typeof value === 'string') {
      // Caso JSON: "[1,2]"
      if (value.startsWith('[')) {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
        } catch {
          return [Number(value)];
        }
      }

      // Caso simple: "4"
      return [Number(value)];
    }

    // Si viene como array tipo ["4", "5"]
    if (Array.isArray(value)) {
      return value.map((v) => Number(v));
    }

    return [];
  })
  @IsArray({ message: 'categoriaIds debe ser un array' })
  @ArrayNotEmpty({ message: 'Debe seleccionar al menos una categoríaaa' })
  @IsInt({ each: true, message: 'Cada categoriaId debe ser un número entero' })
  @Type(() => Number)
  categoriaIds: number[];
}

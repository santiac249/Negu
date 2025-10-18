import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  MaxLength, 
  MinLength 
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoriaDto {
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  categoria: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  descripcion?: string;

  @IsOptional()
  @IsString()
  foto?: string;
}
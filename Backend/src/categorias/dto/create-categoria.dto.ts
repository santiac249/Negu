// create-categoria.dto.ts
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCategoriaDto {
  @IsNotEmpty()
  @IsString()
  categoria: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  foto?: string;
}

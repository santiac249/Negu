import { IsNotEmpty, IsString, IsOptional, IsInt, IsArray, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class CreateMarcaDto {
  @IsNotEmpty()
  @IsString()
  marca: string;

  @IsOptional()
  @IsString()
  foto?: string;
}
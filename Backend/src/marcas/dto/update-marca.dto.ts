import { PartialType } from '@nestjs/mapped-types';
import { CreateMarcaDto } from './create-marca.dto';
import { IsOptional } from 'class-validator';

export class UpdateMarcaDto extends PartialType(CreateMarcaDto) {
  @IsOptional()
  marca?: string;

  @IsOptional()
  foto?: string;
}
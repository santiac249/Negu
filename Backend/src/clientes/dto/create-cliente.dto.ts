// src/clientes/dto/create-cliente.dto.ts
import { IsString, IsEmail, IsPhoneNumber, IsOptional, IsISO8601, IsIn, Length, Matches } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' })
  nombre: string;

  @IsOptional()
  @IsEmail({}, { message: 'Correo inválido' })
  correo?: string;

  @IsOptional()
  @Matches(/^[0-9]{7,12}$/, { message: 'El documento debe contener entre 7 y 12 dígitos' })
  telefono?: string;

  @IsString()
  @Matches(/^[0-9]{6,15}$/, { message: 'Documento inválido (6-15 dígitos)' })
  documento: string;

  @IsOptional()
  @IsString()
  @Length(5, 255, { message: 'La dirección debe tener entre 5 y 255 caracteres' })
  direccion?: string;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Fecha de nacimiento inválida (formato ISO8601)' })
  fecha_nacimiento?: string;

  @IsOptional()
  @IsIn(['M', 'F', 'O'], { message: 'Sexo debe ser M, F u O' })
  sexo?: string;
}
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty()
  rol_id: number;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  usuario: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  cedula: string;

  @IsNotEmpty()
  @MinLength(6)
  contrasena: string;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsString()
  telefono?: string;


}

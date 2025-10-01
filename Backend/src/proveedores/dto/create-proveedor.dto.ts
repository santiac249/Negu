import { IsNotEmpty, IsOptional, IsString, IsPhoneNumber, IsEmail } from 'class-validator';

export class CreateProveedorDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsPhoneNumber()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}
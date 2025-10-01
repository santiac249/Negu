import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUsuarioDto) {
    const hashedPassword = await bcrypt.hash(data.contrasena, 10);
    return this.prisma.usuarios.create({
      data: {
        ...data,
        contrasena: hashedPassword,
        activo: true, // valor por defecto
      },
    });
  }

  findAll() {
    return this.prisma.usuarios.findMany();
  }

  findByCedula(cedula: string) {
    return this.prisma.usuarios.findUnique({
      where: { cedula },
    });
  }

  findByUsuario(usuario: string) {
    return this.prisma.usuarios.findUnique({
      where: { usuario },
      include: { rol: true },
    });
  }

  async findById(id: number) {
    return this.prisma.usuarios.findUnique({
      where: { id },
      include: { rol: true },
    });
  }

async update(id: number, data: UpdateUsuarioDto) {
  const existingUser = await this.prisma.usuarios.findUnique({ where: { id } });

  if (!existingUser) {
    throw new Error(`Usuario con ID ${id} no encontrado`);
  }

  const updateData: any = {};

  if (data.nombre?.trim()) updateData.nombre = data.nombre.trim();
  if (data.usuario?.trim()) updateData.usuario = data.usuario.trim();
  if (data.cedula?.trim()) updateData.cedula = data.cedula.trim();
  if (data.correo?.trim()) updateData.correo = data.correo.trim();
  if (data.telefono?.trim()) updateData.telefono = data.telefono.trim();
  if (data.rol_id) updateData.rol_id = data.rol_id;
  if (typeof data.activo === 'boolean') updateData.activo = data.activo;
  if (data.foto?.trim()) updateData.foto = data.foto.trim();

  if (data.contrasena?.trim()) {
    updateData.contrasena = await bcrypt.hash(data.contrasena.trim(), 10);
  }

  if (Object.keys(updateData).length === 0) {
    return existingUser; // No hay cambios
  }

  return this.prisma.usuarios.update({
    where: { id },
    data: updateData,
  });
}



  remove(id: number) {
    return this.prisma.usuarios.delete({
      where: { id },
    });
  }
}

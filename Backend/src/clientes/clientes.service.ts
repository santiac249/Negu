import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: string) {
    try {
      const where: Prisma.ClientesWhereInput | undefined = query
        ? {
            OR: [
              { nombre: { contains: query } },
              { correo: { contains: query } },
              { telefono: { contains: query } },
              { documento: { contains: query } },
            ],
          }
        : undefined;

      return await this.prisma.clientes.findMany({
        where,
        include: {
          planSepares: {
            where: { 
              estado: { in: ['Activo', 'activo'] }
            },
            select: { id: true, estado: true }
          },
        },
        orderBy: { f_creacion: 'desc' },
        take: 100, // Límite de seguridad
      });
    } catch (error) {
      throw new BadRequestException('Error al buscar clientes');
    }
  }

  async findOne(id: number) {
    const cliente = await this.prisma.clientes.findUnique({
      where: { id },
      include: {
        planSepares: {
          orderBy: { fechaCreacion: 'desc' },
        },
        ventas: {
          include: {
            detalles: {
              select: {
                cantidad: true,
                precio: true,
              },
            },
          },
          orderBy: { fecha: 'desc' },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return cliente;
  }

  async create(data: CreateClienteDto) {
    // Validar documento único
    const existente = await this.prisma.clientes.findUnique({
      where: { documento: data.documento },
    });

    if (existente) {
      throw new BadRequestException('El documento ya está registrado');
    }

    try {
      return await this.prisma.clientes.create({
        data: {
          nombre: data.nombre.trim(),
          correo: data.correo?.toLowerCase().trim(),
          telefono: data.telefono?.trim(),
          documento: data.documento.trim(),
          direccion: data.direccion?.trim(),
          foto: data.foto,
          fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : null,
          sexo: data.sexo,
        },
        include: {
          planSepares: { select: { id: true } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('El documento ya existe');
        }
      }
      throw new BadRequestException('Error al crear cliente');
    }
  }

  async update(id: number, data: UpdateClienteDto) {
    // Verificar que el cliente existe
    await this.findOne(id);

    // Validar documento único si se actualiza
    if (data.documento) {
      const existente = await this.prisma.clientes.findUnique({
        where: { documento: data.documento },
      });

      if (existente && existente.id !== id) {
        throw new BadRequestException('El documento ya está registrado por otro cliente');
      }
    }

    try {
      return await this.prisma.clientes.update({
        where: { id },
        data: {
          nombre: data.nombre?.trim(),
          correo: data.correo?.toLowerCase().trim(),
          telefono: data.telefono?.trim(),
          documento: data.documento?.trim(),
          direccion: data.direccion?.trim(),
          foto: data.foto,
          fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : undefined,
          sexo: data.sexo,
        },
        include: {
          planSepares: { select: { id: true } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('El documento ya existe');
        }
      }
      throw new BadRequestException('Error al actualizar cliente');
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.clientes.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('No se puede eliminar el cliente porque tiene ventas o planes vinculados');
        }
      }
      throw new BadRequestException('Error al eliminar cliente');
    }
  }
}
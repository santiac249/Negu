import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { FilterGastoDto } from './dto/filter-gasto.dto';

@Injectable()
export class GastosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener todos los gastos con filtros y paginación
   */
  async findAll(filter: FilterGastoDto) {
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.usuarioId) {
      where.usuarioId = filter.usuarioId;
    }

    if (filter.proveedorId) {
      where.proveedorId = filter.proveedorId;
    }

    if (filter.concepto) {
      where.concepto = {
        contains: filter.concepto,
        mode: 'insensitive',
      };
    }

    if (filter.tipo) {
      where.tipo = filter.tipo;
    }

    if (filter.fechaInicio || filter.fechaFin) {
      where.fecha = {};
      if (filter.fechaInicio) {
        where.fecha.gte = new Date(filter.fechaInicio);
      }
      if (filter.fechaFin) {
        where.fecha.lte = new Date(filter.fechaFin);
      }
    }

    const [gastos, total] = await Promise.all([
      this.prisma.gastos.findMany({
        where,
        include: {
          usuario: {
            select: { id: true, nombre: true, usuario: true },
          },
          proveedor: {
            select: { id: true, nombre: true },
          },
        },
        orderBy: { fecha: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.gastos.count({ where }),
    ]);

    return {
      data: gastos,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener un gasto por ID
   */
  async findOne(id: number) {
    const gasto = await this.prisma.gastos.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, nombre: true, usuario: true },
        },
        proveedor: {
          select: { id: true, nombre: true, telefono: true, correo: true },
        },
      },
    });

    if (!gasto) {
      throw new NotFoundException(`Gasto con ID ${id} no encontrado`);
    }

    return gasto;
  }

  /**
   * Crear un nuevo gasto
   */
  async create(createGastoDto: CreateGastoDto) {
    if (createGastoDto.monto <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    // Validar que el usuario existe
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: createGastoDto.usuarioId },
    });

    if (!usuario) {
      throw new BadRequestException(
        `Usuario con ID ${createGastoDto.usuarioId} no existe`,
      );
    }

    // Validar proveedor si se proporciona
    if (createGastoDto.proveedorId) {
      const proveedor = await this.prisma.proveedores.findUnique({
        where: { id: createGastoDto.proveedorId },
      });

      if (!proveedor) {
        throw new BadRequestException(
          `Proveedor con ID ${createGastoDto.proveedorId} no existe`,
        );
      }
    }

    return await this.prisma.gastos.create({
      data: {
        usuarioId: createGastoDto.usuarioId,
        proveedorId: createGastoDto.proveedorId,
        concepto: createGastoDto.concepto,
        monto: createGastoDto.monto,
        tipo: createGastoDto.tipo,
        fecha: createGastoDto.fecha || new Date(),
      },
      include: {
        usuario: {
          select: { id: true, nombre: true, usuario: true },
        },
        proveedor: {
          select: { id: true, nombre: true },
        },
      },
    });
  }

  /**
   * Actualizar un gasto
   */
  async update(id: number, updateGastoDto: UpdateGastoDto) {
    const gasto = await this.prisma.gastos.findUnique({
      where: { id },
    });

    if (!gasto) {
      throw new NotFoundException(`Gasto con ID ${id} no encontrado`);
    }

    if (updateGastoDto.monto !== undefined && updateGastoDto.monto <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    // Validar usuario si se actualiza
    if (updateGastoDto.usuarioId) {
      const usuario = await this.prisma.usuarios.findUnique({
        where: { id: updateGastoDto.usuarioId },
      });
      if (!usuario) {
        throw new BadRequestException(
          `Usuario con ID ${updateGastoDto.usuarioId} no existe`,
        );
      }
    }

    // Validar proveedor si se actualiza
    if (updateGastoDto.proveedorId) {
      const proveedor = await this.prisma.proveedores.findUnique({
        where: { id: updateGastoDto.proveedorId },
      });
      if (!proveedor) {
        throw new BadRequestException(
          `Proveedor con ID ${updateGastoDto.proveedorId} no existe`,
        );
      }
    }

    return await this.prisma.gastos.update({
      where: { id },
      data: {
        ...(updateGastoDto.usuarioId && {
          usuarioId: updateGastoDto.usuarioId,
        }),
        ...(updateGastoDto.proveedorId && {
          proveedorId: updateGastoDto.proveedorId,
        }),
        ...(updateGastoDto.concepto && {
          concepto: updateGastoDto.concepto,
        }),
        ...(updateGastoDto.monto && {
          monto: updateGastoDto.monto,
        }),
        ...(updateGastoDto.tipo && {
          tipo: updateGastoDto.tipo,
        }),
        ...(updateGastoDto.fecha && {
          fecha: new Date(updateGastoDto.fecha),
        }),
      },
      include: {
        usuario: {
          select: { id: true, nombre: true, usuario: true },
        },
        proveedor: {
          select: { id: true, nombre: true },
        },
      },
    });
  }

  /**
   * Eliminar un gasto
   */
  async remove(id: number) {
    const gasto = await this.prisma.gastos.findUnique({
      where: { id },
    });

    if (!gasto) {
      throw new NotFoundException(`Gasto con ID ${id} no encontrado`);
    }

    return await this.prisma.gastos.delete({
      where: { id },
    });
  }

  /**
   * Obtener resumen de gastos por tipo
   */
  async getResumenPorTipo() {
    const resumen = await this.prisma.gastos.groupBy({
      by: ['tipo'],
      _sum: {
        monto: true,
      },
      _count: true,
    });

    return resumen.map((item) => ({
      tipo: item.tipo,
      total: item._sum.monto,
      cantidad: item._count,
    }));
  }

  /**
   * Obtener gastos por período
   */
  async getGastosPorPeriodo(fechaInicio: Date, fechaFin: Date) {
    return await this.prisma.gastos.findMany({
      where: {
        fecha: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin),
        },
      },
      include: {
        usuario: {
          select: { id: true, nombre: true },
        },
        proveedor: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  /**
   * Obtener total de gastos en un período
   */
  async getTotalGastosPeriodo(fechaInicio: Date, fechaFin: Date) {
    const result = await this.prisma.gastos.aggregate({
      where: {
        fecha: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin),
        },
      },
      _sum: {
        monto: true,
      },
      _count: true,
    });

    return {
      total: result._sum.monto || 0,
      cantidad: result._count,
    };
  }
}

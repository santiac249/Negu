import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { CreateGastoRecurrenteDto } from './dto/create-gasto-recurrente.dto';
import { UpdateGastoRecurrenteDto } from './dto/update-gasto-recurrente.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GastosService {
  constructor(private prisma: PrismaService) {}

  // ==================== GASTOS ====================

  async findAll(filtros?: {
    tipo?: string;
    proveedorId?: number;
    usuarioId?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }) {
    const where: Prisma.GastosWhereInput = {};

    if (filtros?.tipo) where.tipo = filtros.tipo;
    if (filtros?.proveedorId) where.proveedorId = filtros.proveedorId;
    if (filtros?.usuarioId) where.usuarioId = filtros.usuarioId;

    if (filtros?.fecha_inicio || filtros?.fecha_fin) {
      where.fecha = {
        ...(filtros.fecha_inicio && { gte: new Date(filtros.fecha_inicio) }),
        ...(filtros.fecha_fin && { lte: new Date(filtros.fecha_fin) }),
      };
    }

    return await this.prisma.gastos.findMany({
      where,
      include: {
        usuario: { select: { nombre: true } },
        proveedor: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async findOne(id: number) {
    const gasto = await this.prisma.gastos.findUnique({
      where: { id },
      include: {
        usuario: true,
        proveedor: true,
      },
    });

    if (!gasto) {
      throw new NotFoundException(`Gasto con ID ${id} no encontrado`);
    }

    return gasto;
  }

  async create(usuarioId: number, data: CreateGastoDto) {
    if (data.proveedorId) {
      const proveedorExists = await this.prisma.proveedores.findUnique({
        where: { id: data.proveedorId },
      });

      if (!proveedorExists) {
        throw new BadRequestException('Proveedor no encontrado');
      }
    }

    try {
      return await this.prisma.gastos.create({
        data: {
          concepto: data.concepto.trim(),
          monto: data.monto,
          tipo: data.tipo,
          usuarioId,
          proveedorId: data.proveedorId || null,
        },
        include: {
          usuario: { select: { nombre: true } },
          proveedor: { select: { nombre: true } },
        },
      });
    } catch (error) {
      throw new BadRequestException('Error al crear gasto');
    }
  }

  async update(id: number, usuarioId: number, rol: string, data: UpdateGastoDto) {
    await this.findOne(id);

    // Solo Admin puede editar
    if (rol !== 'Administrador') {
      throw new ForbiddenException('Solo administradores pueden editar gastos');
    }

    if (data.proveedorId) {
      const proveedorExists = await this.prisma.proveedores.findUnique({
        where: { id: data.proveedorId },
      });

      if (!proveedorExists) {
        throw new BadRequestException('Proveedor no encontrado');
      }
    }

    try {
      return await this.prisma.gastos.update({
        where: { id },
        data: {
          concepto: data.concepto?.trim(),
          monto: data.monto,
          tipo: data.tipo,
          proveedorId: data.proveedorId,
        },
        include: {
          usuario: { select: { nombre: true } },
          proveedor: { select: { nombre: true } },
        },
      });
    } catch (error) {
      throw new BadRequestException('Error al actualizar gasto');
    }
  }

  // Gastos no se pueden eliminar, solo Admin puede crearlos
  async getSummary(fecha_inicio?: string, fecha_fin?: string) {
    const where: Prisma.GastosWhereInput = {};

    if (fecha_inicio || fecha_fin) {
      where.fecha = {
        ...(fecha_inicio && { gte: new Date(fecha_inicio) }),
        ...(fecha_fin && { lte: new Date(fecha_fin) }),
      };
    }

    const gastos = await this.prisma.gastos.findMany({ where });
    const porTipo = {
      OPERACIONAL: gastos
        .filter((g) => g.tipo === 'OPERACIONAL')
        .reduce((sum, g) => sum + g.monto, 0),
      MANTENIMIENTO: gastos
        .filter((g) => g.tipo === 'MANTENIMIENTO')
        .reduce((sum, g) => sum + g.monto, 0),
    };
    const total = gastos.reduce((sum, g) => sum + g.monto, 0);

    return { porTipo, total, cantidad: gastos.length };
  }

  // ==================== GASTOS RECURRENTES ====================

  async findAllRecurrentes() {
    return await this.prisma.gastosRecurrentes.findMany({
      include: {
        usuario: { select: { nombre: true } },
        proveedor: { select: { nombre: true } },
      },
      orderBy: { fecha_inicio: 'desc' },
    });
  }

  async findOneRecurrente(id: number) {
    const recurrente = await this.prisma.gastosRecurrentes.findUnique({
      where: { id },
      include: {
        usuario: true,
        proveedor: true,
      },
    });

    if (!recurrente) {
      throw new NotFoundException(`Gasto recurrente con ID ${id} no encontrado`);
    }

    return recurrente;
  }

  async createRecurrente(usuarioId: number, data: CreateGastoRecurrenteDto) {
    if (data.frecuencia === 'MENSUAL' && !data.dia_del_mes) {
      throw new BadRequestException('dia_del_mes es requerido para frecuencia MENSUAL');
    }

    if (data.proveedorId) {
      const proveedorExists = await this.prisma.proveedores.findUnique({
        where: { id: data.proveedorId },
      });

      if (!proveedorExists) {
        throw new BadRequestException('Proveedor no encontrado');
      }
    }

    try {
      return await this.prisma.gastosRecurrentes.create({
        data: {
          concepto: data.concepto.trim(),
          monto: data.monto,
          frecuencia: data.frecuencia,
          dia_del_mes: data.dia_del_mes || null,
          fecha_inicio: new Date(data.fecha_inicio),
          fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
          activo: true,
          usuarioId,
          proveedorId: data.proveedorId || null,
        },
        include: {
          usuario: { select: { nombre: true } },
          proveedor: { select: { nombre: true } },
        },
      });
    } catch (error) {
      throw new BadRequestException('Error al crear gasto recurrente');
    }
  }

  async updateRecurrente(id: number, rol: string, data: UpdateGastoRecurrenteDto) {
    await this.findOneRecurrente(id);

    // Solo Admin puede editar
    if (rol !== 'Administrador') {
      throw new ForbiddenException('Solo administradores pueden editar gastos recurrentes');
    }

    if (data.frecuencia === 'MENSUAL' && !data.dia_del_mes) {
      throw new BadRequestException('dia_del_mes es requerido para frecuencia MENSUAL');
    }

    try {
      return await this.prisma.gastosRecurrentes.update({
        where: { id },
        data: {
          concepto: data.concepto?.trim(),
          monto: data.monto,
          frecuencia: data.frecuencia,
          dia_del_mes: data.dia_del_mes || null,
          fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : undefined,
          fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : undefined,
        },
        include: {
          usuario: { select: { nombre: true } },
          proveedor: { select: { nombre: true } },
        },
      });
    } catch (error) {
      throw new BadRequestException('Error al actualizar gasto recurrente');
    }
  }

  async toggleRecurrente(id: number, rol: string, activo: boolean) {
    if (rol !== 'Administrador') {
      throw new ForbiddenException('Solo administradores pueden cambiar el estado de gastos recurrentes');
    }

    return await this.prisma.gastosRecurrentes.update({
      where: { id },
      data: { activo },
    });
  }

  // Generar gastos del próximo período (se puede llamar manualmente o vía cron)
  async generarProximoPeriodo(gastosRecurrenteId: number) {
    const recurrente = await this.findOneRecurrente(gastosRecurrenteId);

    if (!recurrente.activo) {
      throw new BadRequestException('Gasto recurrente no activo');
    }

    const ahora = new Date();
    if (recurrente.fecha_fin && ahora > recurrente.fecha_fin) {
      throw new BadRequestException('Gasto recurrente ya ha vencido');
    }

    // Calcular próxima fecha según frecuencia
    let proximaFecha = new Date(recurrente.fecha_inicio);

    // Aquí puedes agregar lógica para calcular próxima fecha según frecuencia
    // Por ahora, asumimos que el usuario decide cuándo generar

    try {
      return await this.prisma.gastos.create({
        data: {
          concepto: `${recurrente.concepto} (Recurrente)`,
          monto: recurrente.monto,
          tipo: 'OPERACIONAL',
          usuarioId: recurrente.usuarioId,
          proveedorId: recurrente.proveedorId,
        },
        include: {
          usuario: { select: { nombre: true } },
          proveedor: { select: { nombre: true } },
        },
      });
    } catch (error) {
      throw new BadRequestException('Error al generar próximo período');
    }
  }
}
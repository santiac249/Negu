import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanSepareDto } from './dto/create-plan-separe.dto';
import { UpdatePlanSepareDto } from './dto/update-plan-separe.dto';
import { addMonths } from 'date-fns';

@Injectable()
export class PlanSepareService {
  constructor(private prisma: PrismaService) {}

  private calcularPorcentajePagado(deudaInicial: number, deudaParcial: number): number {
    if (deudaInicial === 0) return 0;
    const pagado = deudaInicial - deudaParcial;
    return Math.min(100, (pagado / deudaInicial) * 100);
  }

  async create(data: CreatePlanSepareDto) {
    return this.prisma.$transaction(async (tx) => {
      const fechaCreacion = new Date();
      const fechaVencimiento = addMonths(fechaCreacion, 1);
      const porcentajePagado = this.calcularPorcentajePagado(data.deudaInicial, data.deudaParcial);

      const planSepare = await tx.planSepare.create({
        data: {
          clienteId: data.clienteId,
          usuarioId: data.usuarioId,
          deudaInicial: data.deudaInicial,
          deudaParcial: data.deudaParcial,
          estado: 'Activo',
          porcentajePagado,
          fechaCreacion,
          fechaVencimiento,
          productos: {
            create: data.productos.map((p) => ({
              stockId: p.stockId,
              cantidad: p.cantidad,
            })),
          },
        },
        include: { productos: true, cliente: true },
      });

      // descontar stock
      for (const p of data.productos) {
        await tx.stock.update({
          where: { id: p.stockId },
          data: {
            cantidad: { decrement: p.cantidad },
          },
        });
      }

      return planSepare;
    });
  }

  findAll() {
    return this.prisma.planSepare.findMany({
      include: { productos: true, cliente: true, usuario: true },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async findOne(id: number) {
    const plan = await this.prisma.planSepare.findUnique({
      where: { id },
      include: { productos: true, cliente: true, usuario: true },
    });
    if (!plan) throw new NotFoundException('Plan Separe no encontrado');
    return plan;
  }

  async findOneByNombreCliente(nombre: string) {
    const plan = await this.prisma.planSepare.findFirst({
      where: {
        cliente: {
          nombre: {
            contains: nombre,
          },
        },
      },
      include: { productos: true, cliente: true, usuario: true },
    });
    if (!plan) throw new NotFoundException('Plan Separe no encontrado para ese cliente');
    return plan;
  }

  async findOneByCedulaCliente(cedula: string) {
    const plan = await this.prisma.planSepare.findFirst({
      where: {
        cliente: {
          documento: {
            contains: cedula,
          },
        },
      },
      include: { productos: true, cliente: true, usuario: true },
    });
    if (!plan) throw new NotFoundException('Plan Separe no encontrado para esa cédula');
    return plan;
  }

  async update(id: number, data: UpdatePlanSepareDto) {
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.planSepare.findUnique({ where: { id } });
      if (!plan) throw new NotFoundException('Plan Separe no encontrado');

      if (data.estado && !['Activo', 'Incumplido', 'Anulado', 'Finalizado'].includes(data.estado)) {
        throw new BadRequestException('Estado inválido');
      }

      // Actualizar porcentajePagado si deudaInicial o deudaParcial cambian
      let porcentajePagado = plan.porcentajePagado;
      if (data.deudaInicial !== undefined || data.deudaParcial !== undefined) {
        porcentajePagado = this.calcularPorcentajePagado(
          data.deudaInicial ?? plan.deudaInicial,
          data.deudaParcial ?? plan.deudaParcial,
        );
        data.porcentajePagado = porcentajePagado;
      }

      // Eliminar undefined
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined),
      );

      return tx.planSepare.update({
        where: { id },
        data: cleanedData,
      });
    });
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.planSepare.findUnique({ where: { id } });
      if (!plan) throw new NotFoundException('Plan Separe no encontrado');

      if (['Activo', 'Incumplido'].includes(plan.estado)) {
        const productos = await tx.planSepareProducto.findMany({
          where: { planSepareId: id },
        });

        await Promise.all(
          productos.map((p) =>
            tx.stock.update({
              where: { id: p.stockId },
              data: { cantidad: { increment: p.cantidad } },
            }),
          ),
        );
      }

      await tx.planSepareProducto.deleteMany({ where: { planSepareId: id } });
      return tx.planSepare.delete({ where: { id } });
    });
  }

  // NUEVO: Obtener planes vencidos (estado activo y fechaVencimiento pasada)
  findVencidos() {
    const now = new Date();
    return this.prisma.planSepare.findMany({
      where: {
        estado: 'Activo',
        fechaVencimiento: { lt: now },
      },
      include: { productos: true, cliente: true, usuario: true },
    });
  }

  // NUEVO: Obtener planes activos (estado Activo)
  findActivos() {
    return this.prisma.planSepare.findMany({
      where: { estado: 'Activo' },
      include: { productos: true, cliente: true, usuario: true },
      orderBy: { fechaCreacion: 'desc' },
    });
  }
}

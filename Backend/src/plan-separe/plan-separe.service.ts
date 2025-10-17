import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanSepareDto } from './dto/create-plan-separe.dto';
import { UpdatePlanSepareDto } from './dto/update-plan-separe.dto';
import { CreateAbonoPlanSepareDto } from './dto/create-abono-plan-separe.dto';
import { addMonths } from 'date-fns';

@Injectable()
export class PlanSepareService {
  constructor(private prisma: PrismaService) {}

  private calcularPorcentajePagado(deudaInicial: number, deudaParcial: number): number {
    if (deudaInicial <= 0) return 0;
    const pagado = deudaInicial - deudaParcial;
    return Math.max(0, Math.min(100, (pagado / deudaInicial) * 100));
  }

  private async validarStockDisponible(productos: Array<{stockId: number, cantidad: number}>) {
    for (const producto of productos) {
      const stock = await this.prisma.stock.findUnique({
        where: { id: producto.stockId },
        include: { producto: true }
      });

      if (!stock) {
        throw new NotFoundException(`Stock con ID ${producto.stockId} no encontrado`);
      }

      if (stock.cantidad < producto.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para ${stock.producto.nombre}. Disponible: ${stock.cantidad}, Solicitado: ${producto.cantidad}`
        );
      }
    }
  }

  private validateEstado(estado: string): boolean {
    const estadosValidos = ['Activo', 'Incumplido', 'Anulado', 'Finalizado'];
    return estadosValidos.includes(estado);
  }

  async create(data: CreatePlanSepareDto) {
    // Validar que deuda parcial no sea mayor que inicial
    if (data.deudaParcial > data.deudaInicial) {
      throw new BadRequestException('La deuda parcial no puede ser mayor que la deuda inicial');
    }

    // Validar disponibilidad de stock
    await this.validarStockDisponible(data.productos);

    return this.prisma.$transaction(async (tx) => {
      const fechaCreacion = new Date();
      const fechaVencimiento = data.fechaVencimiento 
        ? new Date(data.fechaVencimiento)
        : addMonths(fechaCreacion, 1);

      const porcentajePagado = this.calcularPorcentajePagado(data.deudaInicial, data.deudaParcial);

      const planSepare = await tx.planSepare.create({
        data: {
          clienteId: data.clienteId,
          usuarioId: data.usuarioId,
          deudaInicial: data.deudaInicial,
          deudaParcial: data.deudaParcial,
          estado: data.estado || 'Activo',
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
        include: { 
          productos: {
            include: {
              stock: {
                include: { producto: true, color: true, talla: true }
              }
            }
          }, 
          cliente: true,
          usuario: true 
        },
      });

      // Apartar stock (decrementar)
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

  async createAbono(data: CreateAbonoPlanSepareDto) {
    return this.prisma.$transaction(async (tx) => {
      // Validar que el plan separe existe y está activo
      const planSepare = await tx.planSepare.findUnique({
        where: { id: data.planSepareId },
      });

      if (!planSepare) {
        throw new NotFoundException('Plan Separe no encontrado');
      }

      if (planSepare.estado !== 'Activo') {
        throw new BadRequestException('No se pueden hacer abonos a un plan separe inactivo');
      }

      // Validar que el monto no exceda la deuda pendiente
      if (data.monto > planSepare.deudaParcial) {
        throw new BadRequestException('El monto del abono excede la deuda pendiente');
      }

      // Crear el abono
      const abono = await tx.abonosPlanSepare.create({
        data: {
          planSepareId: data.planSepareId,
          usuarioId: data.usuarioId,
          monto: data.monto,
          concepto: data.concepto || 'Abono parcial',
        },
        include: {
          usuario: true,
        },
      });

      // Actualizar la deuda parcial y porcentaje pagado
      const nuevaDeudaParcial = planSepare.deudaParcial - data.monto;
      const nuevoPorcentajePagado = this.calcularPorcentajePagado(
        planSepare.deudaInicial, 
        nuevaDeudaParcial
      );

      // Si se pagó completamente, finalizar el plan
      const nuevoEstado = nuevaDeudaParcial <= 0 ? 'Finalizado' : planSepare.estado;

      await tx.planSepare.update({
        where: { id: data.planSepareId },
        data: {
          deudaParcial: Math.max(0, nuevaDeudaParcial),
          porcentajePagado: nuevoPorcentajePagado,
          estado: nuevoEstado,
        },
      });

      return abono;
    });
  }

  findAll(estado?: string) {
    // Validar estado si se proporciona
    if (estado && !this.validateEstado(estado)) {
      throw new BadRequestException(`Estado inválido: ${estado}`);
    }

    const where = estado ? { estado } : {};
    
    return this.prisma.planSepare.findMany({
      where,
      include: { 
        productos: {
          include: {
            stock: {
              include: { producto: true, color: true, talla: true }
            }
          }
        }, 
        cliente: true, 
        usuario: true,
        abonos: {
          include: { usuario: true },
          orderBy: { fecha: 'desc' }
        }
      },
      orderBy: { fechaCreacion: 'desc' },
    });
  }
  
  async findAbonos(planSepareId: number) {
    // Validar entrada
    if (!Number.isInteger(planSepareId) || planSepareId <= 0) {
      throw new BadRequestException('ID de plan separe inválido');
    }

    // Validar existencia del plan
    const plan = await this.prisma.planSepare.findUnique({
      where: { id: planSepareId },
    });

    if (!plan) {
      throw new NotFoundException('Plan Separe no encontrado');
    }

    // Traer los abonos asociados
    return this.prisma.abonosPlanSepare.findMany({
      where: { planSepareId },
      include: { usuario: true },
      orderBy: { fecha: 'desc' },
    });
  }

  async findOne(id: number) {
    // Validar entrada
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID inválido');
    }

    const plan = await this.prisma.planSepare.findUnique({
      where: { id },
      include: { 
        productos: {
          include: {
            stock: {
              include: { producto: true, color: true, talla: true }
            }
          }
        }, 
        cliente: true, 
        usuario: true,
        abonos: {
          include: { usuario: true },
          orderBy: { fecha: 'desc' }
        }
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan Separe no encontrado');
    }

    return plan;
  }

  async findOneByNombreCliente(nombre: string) {
    // Validar entrada
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      throw new BadRequestException('Nombre de cliente inválido');
    }

    const nombreLimpio = nombre.trim();

    const plan = await this.prisma.planSepare.findFirst({
      where: {
        cliente: {
          is: {
            nombre: {
              contains: nombreLimpio,
              //mode: 'insensitive',
            },
          },
        },
      },
      include: { 
        productos: {
          include: {
            stock: {
              include: { producto: true, color: true, talla: true }
            }
          }
        }, 
        cliente: true, 
        usuario: true,
        abonos: {
          include: { usuario: true },
          orderBy: { fecha: 'desc' }
        }
      },
      orderBy: { fechaCreacion: 'desc' }, // El más reciente primero
    });

    if (!plan) {
      throw new NotFoundException('Plan Separe no encontrado para ese cliente');
    }

    return plan;
  }

  async findOneByCedulaCliente(cedula: string) {
    // Validar entrada
    if (!cedula || typeof cedula !== 'string' || cedula.trim().length === 0) {
      throw new BadRequestException('Cédula de cliente inválida');
    }

    const cedulaLimpia = cedula.trim();

    const plan = await this.prisma.planSepare.findFirst({
      where: {
        cliente: {
          documento: {
            contains: cedulaLimpia,
            //mode: 'insensitive',
          },
        },
      },
      include: { 
        productos: {
          include: {
            stock: {
              include: { producto: true, color: true, talla: true }
            }
          }
        }, 
        cliente: true, 
        usuario: true,
        abonos: {
          include: { usuario: true },
          orderBy: { fecha: 'desc' }
        }
      },
      orderBy: { fechaCreacion: 'desc' }, // El más reciente primero
    });

    if (!plan) {
      throw new NotFoundException('Plan Separe no encontrado para esa cédula');
    }

    return plan;
  }

  async update(id: number, data: UpdatePlanSepareDto) {
    // Validar entrada
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID inválido');
    }

    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.planSepare.findUnique({ 
        where: { id },
        include: { productos: true } // Para verificar stock si es necesario
      });

      if (!plan) {
        throw new NotFoundException('Plan Separe no encontrado');
      }

      // Validar estado si se está cambiando
      if (data.estado && !this.validateEstado(data.estado)) {
        throw new BadRequestException(`Estado inválido: ${data.estado}`);
      }

      // Validar lógica de negocio para cambios de estado
      if (data.estado && data.estado !== plan.estado) {
        // No se puede cambiar de Finalizado a otro estado
        if (plan.estado === 'Finalizado' && data.estado !== 'Finalizado') {
          throw new BadRequestException('No se puede cambiar el estado de un plan finalizado');
        }

        // Si se está anulando y había stock apartado, validar que se puede devolver
        if (data.estado === 'Anulado' && ['Activo', 'Incumplido'].includes(plan.estado)) {
          // Aquí podrías agregar validación adicional si es necesario
        }
      }

      // Actualizar porcentajePagado si deudaInicial o deudaParcial cambian
      let porcentajePagado = plan.porcentajePagado;
      if (data.deudaInicial !== undefined || data.deudaParcial !== undefined) {
        const nuevaDeudaInicial = data.deudaInicial ?? plan.deudaInicial;
        const nuevaDeudaParcial = data.deudaParcial ?? plan.deudaParcial;

        // Validar que la deuda parcial no sea mayor que la inicial
        if (nuevaDeudaParcial > nuevaDeudaInicial) {
          throw new BadRequestException('La deuda parcial no puede ser mayor que la deuda inicial');
        }

        porcentajePagado = this.calcularPorcentajePagado(nuevaDeudaInicial, nuevaDeudaParcial);
        data.porcentajePagado = porcentajePagado;
      }

      // Limpiar datos undefined para evitar errores de Prisma
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined),
      );

      const updatedPlan = await tx.planSepare.update({
        where: { id },
        data: cleanedData,
        include: { 
          productos: {
            include: {
              stock: {
                include: { producto: true, color: true, talla: true }
              }
            }
          }, 
          cliente: true, 
          usuario: true,
          abonos: {
            include: { usuario: true },
            orderBy: { fecha: 'desc' }
          }
        },
      });

      return updatedPlan;
    });
  }

  async remove(id: number) {
    // Validar entrada
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID inválido');
    }

    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.planSepare.findUnique({ 
        where: { id },
        include: { productos: true }
      });

      if (!plan) {
        throw new NotFoundException('Plan Separe no encontrado');
      }

      // Si el plan está activo o incumplido, devolver el stock apartado
      if (['Activo', 'Incumplido'].includes(plan.estado)) {
        const productos = await tx.planSepareProducto.findMany({
          where: { planSepareId: id },
        });

        // Devolver stock de cada producto
        for (const producto of productos) {
          await tx.stock.update({
            where: { id: producto.stockId },
            data: { cantidad: { increment: producto.cantidad } },
          });
        }
      }

      // Eliminar abonos relacionados primero
      await tx.abonosPlanSepare.deleteMany({ 
        where: { planSepareId: id } 
      });

      // Eliminar productos del plan
      await tx.planSepareProducto.deleteMany({ 
        where: { planSepareId: id } 
      });

      // Eliminar el plan separe
      const deletedPlan = await tx.planSepare.delete({ 
        where: { id } 
      });

      return deletedPlan;
    });
  }

  // Métodos adicionales para consultas específicas

  async findVencidos() {
    const now = new Date();
    return this.prisma.planSepare.findMany({
      where: {
        estado: 'Activo',
        fechaVencimiento: { lt: now },
      },
      include: { 
        productos: {
          include: {
            stock: {
              include: { producto: true, color: true, talla: true }
            }
          }
        }, 
        cliente: true, 
        usuario: true,
        abonos: {
          include: { usuario: true },
          orderBy: { fecha: 'desc' }
        }
      },
      orderBy: { fechaVencimiento: 'asc' },
    });
  }

  async findActivos() {
    return this.prisma.planSepare.findMany({
      where: { estado: 'Activo' },
      include: { 
        productos: {
          include: {
            stock: {
              include: { producto: true, color: true, talla: true }
            }
          }
        }, 
        cliente: true, 
        usuario: true,
        abonos: {
          include: { usuario: true },
          orderBy: { fecha: 'desc' }
        }
      },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async findByDateRange(fechaInicio: Date, fechaFin: Date) {
    // Validar fechas
    if (!fechaInicio || !fechaFin || fechaInicio > fechaFin) {
      throw new BadRequestException('Rango de fechas inválido');
    }

    return this.prisma.planSepare.findMany({
      where: {
        fechaCreacion: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      include: { 
        productos: {
          include: {
            stock: {
              include: { producto: true, color: true, talla: true }
            }
          }
        }, 
        cliente: true, 
        usuario: true,
        abonos: {
          include: { usuario: true },
          orderBy: { fecha: 'desc' }
        }
      },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  // Método para obtener estadísticas
  async getEstadisticas() {
    const [
      totalPlanes,
      planesActivos,
      planesFinalizados,
      planesVencidos,
      totalDeuda,
      totalPagado
    ] = await Promise.all([
      this.prisma.planSepare.count(),
      this.prisma.planSepare.count({ where: { estado: 'Activo' } }),
      this.prisma.planSepare.count({ where: { estado: 'Finalizado' } }),
      this.prisma.planSepare.count({ 
        where: { 
          estado: 'Activo',
          fechaVencimiento: { lt: new Date() }
        } 
      }),
      this.prisma.planSepare.aggregate({
        _sum: { deudaInicial: true }
      }),
      this.prisma.planSepare.aggregate({
        _sum: { 
          deudaInicial: true 
        },
        where: { estado: 'Finalizado' }
      })
    ]);

    return {
      totalPlanes,
      planesActivos,
      planesFinalizados,
      planesVencidos,
      totalDeuda: totalDeuda._sum.deudaInicial || 0,
      totalPagado: totalPagado._sum.deudaInicial || 0,
    };
  }
}
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { FilterVentaDto } from './dto/filter-venta.dto';

@Injectable()
export class VentasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener todas las ventas con filtros y paginación
   */
  async findAll(filter: FilterVentaDto) {
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.clienteId) {
      where.clienteId = filter.clienteId;
    }

    if (filter.usuarioId) {
      where.usuarioId = filter.usuarioId;
    }

    if (filter.metPagoId) {
      where.metPagoId = filter.metPagoId;
    }

    if (filter.estado) {
      where.estado = filter.estado;
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

    const [ventas, total] = await Promise.all([
      this.prisma.ventas.findMany({
        where,
        include: {
          cliente: {
            select: { id: true, nombre: true, documento: true },
          },
          usuario: {
            select: { id: true, nombre: true, usuario: true },
          },
          metodoPago: {
            select: { id: true, metodo: true },
          },
          detalles: {
            include: {
              stock: {
                include: {
                  producto: true,
                  color: true,
                  talla: true,
                },
              },
            },
          },
        },
        orderBy: { fecha: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.ventas.count({ where }),
    ]);

    return {
      data: ventas,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener una venta por ID
   */
  async findOne(id: number) {
    const venta = await this.prisma.ventas.findUnique({
      where: { id },
      include: {
        cliente: true,
        usuario: {
          select: { id: true, nombre: true, usuario: true },
        },
        metodoPago: true,
        detalles: {
          include: {
            stock: {
              include: {
                producto: true,
                color: true,
                talla: true,
              },
            },
          },
        },
      },
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return venta;
  }

  /**
   * Crear una nueva venta con detalles (transacción atómica)
   */
  async create(createVentaDto: CreateVentaDto) {
    if (!createVentaDto.detalles || createVentaDto.detalles.length === 0) {
      throw new BadRequestException('La venta debe tener al menos un detalle');
    }

    // Validar usuario
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: createVentaDto.usuarioId },
    });

    if (!usuario) {
      throw new BadRequestException(
        `Usuario con ID ${createVentaDto.usuarioId} no existe`,
      );
    }

    // Validar cliente si se proporciona
    if (createVentaDto.clienteId) {
      const cliente = await this.prisma.clientes.findUnique({
        where: { id: createVentaDto.clienteId },
      });

      if (!cliente) {
        throw new BadRequestException(
          `Cliente con ID ${createVentaDto.clienteId} no existe`,
        );
      }
    }

    // Validar método de pago
    const metodoPago = await this.prisma.metodosPago.findUnique({
      where: { id: createVentaDto.metPagoId },
    });

    if (!metodoPago) {
      throw new BadRequestException(
        `Método de pago con ID ${createVentaDto.metPagoId} no existe`,
      );
    }

    // Usar transacción para garantizar integridad de datos
    return await this.prisma.$transaction(async (tx) => {
      let total = 0;
      const detallesVenta: {
        stockId: number;
        cantidad: number;
        precio: number;
      }[] = [];

      // Procesar cada detalle de la venta
      for (const detalle of createVentaDto.detalles) {
        // Obtener el stock
        const stock = await tx.stock.findUnique({
          where: { id: detalle.stockId },
        });

        if (!stock) {
          throw new BadRequestException(
            `Stock con ID ${detalle.stockId} no existe`,
          );
        }

        // Validar cantidad disponible
        if (stock.cantidad < detalle.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para el producto. Disponible: ${stock.cantidad}, Solicitado: ${detalle.cantidad}`,
          );
        }

        // Descontar del stock
        await tx.stock.update({
          where: { id: detalle.stockId },
          data: {
            cantidad: { decrement: detalle.cantidad },
          },
        });

        // Acumular total
        total += detalle.cantidad * detalle.precio;

        detallesVenta.push({
          stockId: detalle.stockId,
          cantidad: detalle.cantidad,
          precio: detalle.precio,
        });
      }

      // Aplicar descuento si existe
      const descuento = createVentaDto.descuento || 0;
      const totalFinal = total - descuento;

      if (totalFinal <= 0) {
        throw new BadRequestException(
          'El total de la venta no puede ser cero o negativo después de aplicar descuento',
        );
      }

      // Crear la venta
      const venta = await tx.ventas.create({
        data: {
          clienteId: createVentaDto.clienteId,
          usuarioId: createVentaDto.usuarioId,
          metPagoId: createVentaDto.metPagoId,
          total: totalFinal,
          descuento,
          fecha: createVentaDto.fecha || new Date(),
          estado: 'Completada',
          detalles: {
            create: detallesVenta,
          },
        },
        include: {
          cliente: true,
          usuario: {
            select: { id: true, nombre: true, usuario: true },
          },
          metodoPago: true,
          detalles: {
            include: {
              stock: {
                include: {
                  producto: true,
                  color: true,
                  talla: true,
                },
              },
            },
          },
        },
      });

      return venta;
    });
  }

  /**
   * Actualizar una venta (solo ciertos campos)
   */
  async update(id: number, updateVentaDto: UpdateVentaDto) {
    const venta = await this.prisma.ventas.findUnique({
      where: { id },
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    // Validar estado de la venta
    if (venta.estado !== 'Completada') {
      throw new BadRequestException(
        `No se puede actualizar una venta con estado ${venta.estado}`,
      );
    }

    // Validar cliente si se actualiza
    if (updateVentaDto.clienteId) {
      const cliente = await this.prisma.clientes.findUnique({
        where: { id: updateVentaDto.clienteId },
      });
      if (!cliente) {
        throw new BadRequestException(
          `Cliente con ID ${updateVentaDto.clienteId} no existe`,
        );
      }
    }

    // Validar método de pago si se actualiza
    if (updateVentaDto.metPagoId) {
      const metodoPago = await this.prisma.metodosPago.findUnique({
        where: { id: updateVentaDto.metPagoId },
      });
      if (!metodoPago) {
        throw new BadRequestException(
          `Método de pago con ID ${updateVentaDto.metPagoId} no existe`,
        );
      }
    }

    return await this.prisma.ventas.update({
      where: { id },
      data: {
        ...(updateVentaDto.clienteId && {
          clienteId: updateVentaDto.clienteId,
        }),
        ...(updateVentaDto.metPagoId && {
          metPagoId: updateVentaDto.metPagoId,
        }),
        ...(updateVentaDto.descuento !== undefined && {
          descuento: updateVentaDto.descuento,
        }),
      },
      include: {
        cliente: true,
        usuario: true,
        metodoPago: true,
        detalles: {
          include: {
            stock: {
              include: {
                producto: true,
                color: true,
                talla: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Cancelar una venta (revertir stock)
   */
  async cancelar(id: number) {
    const venta = await this.prisma.ventas.findUnique({
      where: { id },
      include: { detalles: true },
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // Restaurar stock
      for (const detalle of venta.detalles) {
        await tx.stock.update({
          where: { id: detalle.stockId },
          data: {
            cantidad: { increment: detalle.cantidad },
          },
        });
      }

      // Actualizar estado de la venta
      return await tx.ventas.update({
        where: { id },
        data: { estado: 'Cancelada' },
        include: {
          cliente: true,
          usuario: true,
          metodoPago: true,
          detalles: true,
        },
      });
    });
  }

  /**
   * Obtener ventas por período
   */
  async getVentasPorPeriodo(fechaInicio: Date, fechaFin: Date) {
    return await this.prisma.ventas.findMany({
      where: {
        fecha: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin),
        },
      },
      include: {
        cliente: true,
        usuario: {
          select: { id: true, nombre: true },
        },
        metodoPago: true,
        detalles: true,
      },
      orderBy: { fecha: 'desc' },
    });
  }

  /**
   * Obtener total de ventas en un período
   */
  async getTotalVentasPeriodo(fechaInicio: Date, fechaFin: Date) {
    const result = await this.prisma.ventas.aggregate({
      where: {
        fecha: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin),
        },
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    return {
      totalVentas: result._sum.total || 0,
      cantidad: result._count,
      promedioVenta: result._count > 0 ? (result._sum.total || 0) / result._count : 0,
    };
  }

  /**
   * Obtener ventas por cliente
   */
  async getVentasPorCliente(clienteId: number) {
    const cliente = await this.prisma.clientes.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    return await this.prisma.ventas.findMany({
      where: { clienteId },
      include: {
        usuario: true,
        metodoPago: true,
        detalles: {
          include: {
            stock: {
              include: { producto: true },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  /**
   * Obtener top 10 productos más vendidos
   */
  async getProductosMasVendidos(limit: number = 10) {
    const result = await this.prisma.detalleVentas.groupBy({
      by: ['stockId'],
      _sum: {
        cantidad: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          cantidad: 'desc',
        },
      },
      take: limit,
    });

    // Obtener información de los productos
    const productosMasVendidos = await Promise.all(
      result.map(async (item) => {
        const stock = await this.prisma.stock.findUnique({
          where: { id: item.stockId },
          include: {
            producto: true,
            color: true,
            talla: true,
          },
        });

        return {
          producto: stock.producto,
          color: stock.color,
          talla: stock.talla,
          cantidadVendida: item._sum.cantidad,
          transacciones: item._count,
        };
      }),
    );

    return productosMasVendidos;
  }

  /**
   * Obtener resumen de ventas por método de pago
   */
  async getResumenPorMetodoPago() {
    const resumen = await this.prisma.ventas.groupBy({
      by: ['metPagoId'],
      _sum: {
        total: true,
      },
      _count: true,
    });

    return await Promise.all(
      resumen.map(async (item) => {
        const metodoPago = await this.prisma.metodosPago.findUnique({
          where: { id: item.metPagoId },
        });

        return {
          metodo: metodoPago.metodo,
          totalVentas: item._sum.total,
          cantidad: item._count,
        };
      }),
    );
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompraDto } from './dto/create-compra.dto';

@Injectable()
export class ComprasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.compras.findMany({
        include: {
        proveedor: true,
        usuario: true,
        detalles: {
            include: {
            stock: {
                include: {
                producto: true,
                color: true,
                talla: true,
                }
            }
            }
        }
        },
        orderBy: { fecha: 'desc' },
    });
    }

  async create(data: CreateCompraDto) {
    return this.prisma.$transaction(async (tx) => {
      let total = 0;
      const detallesCompra: {
        stockId: number;
        cantidad: number;
        precio: number;
      }[] = [];

      for (const det of data.detalles) {
        let stock = await tx.stock.findFirst({
          where: {
            productoId: det.productoId,
            colorId: det.colorId ?? null,
            tallaId: det.tallaId ?? null,
          },
        });

        if (stock) {
          stock = await tx.stock.update({
            where: { id: stock.id },
            data: {
              cantidad: { increment: det.cantidad },
              precio_compra: det.precio_compra,
            },
          });
        } else {
          stock = await tx.stock.create({
            data: {
              productoId: det.productoId,
              colorId: det.colorId ?? null,
              tallaId: det.tallaId ?? null,
              cantidad: det.cantidad,
              precio_compra: det.precio_compra,
              precio_venta: 0,  // Por definir o default
            },
          });
        }

        total += det.cantidad * det.precio_compra;

        detallesCompra.push({
          stockId: stock.id,
          cantidad: det.cantidad,
          precio: det.precio_compra,
        });
      }

      if (total <= 0) {
        throw new BadRequestException('El total calculado no puede ser cero o negativo');
      }

      const compra = await tx.compras.create({
        data: {
          proveedorId: data.proveedorId,
          usuarioId: data.usuarioId,
          fecha: new Date(data.fecha),
          total,
          detalles: {
            create: detallesCompra,
          },
        },
        include: { detalles: true },
      });

      return compra;
    });
  }

}
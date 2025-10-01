import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.stock.findMany({
      include: { producto: true, color: true, talla: true },
    });
  }

  findOne(id: number) {
    return this.prisma.stock.findUnique({
      where: { id },
      include: { producto: true, color: true, talla: true },
    });
  }

  create(data: CreateStockDto) {
    return this.prisma.stock.create({ data });
  }

  update(id: number, data: UpdateStockDto) {
    return this.prisma.stock.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.stock.delete({
      where: { id },
    });
  }

  async findStockByProducto(
    productoId: number,
    options?: { order?: 'asc' | 'desc'; colorId?: number; tallaId?: number },
    ) {
    const where: any = { productoId };

    if (options?.colorId !== undefined) where.colorId = options.colorId;
    if (options?.tallaId !== undefined) where.tallaId = options.tallaId;

    return this.prisma.stock.findMany({
        where,
        include: {
        color: true,
        talla: true,
        },
        orderBy: {
        precio_compra: options?.order || 'asc',
        },
    });
    }
}

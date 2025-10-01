import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.productos.findMany({
      include: { subcategorias: true, marca: true },
    });
  }

  findOne(id: number) {
    return this.prisma.productos.findUnique({
      where: { id },
      include: { subcategorias: true, marca: true },
    });
  }

  async create(data: CreateProductoDto) {
    return this.prisma.productos.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        marca_id: data.marca_id,
        ...(data.foto && { foto: data.foto }),
        //                  Object literal may only specify known properties, and 'foto' does not exist in type 'Without<ProductosCreateInput, ProductosUncheckedCreateInput> & ProductosUncheckedCreateInput'.
        subcategorias: { 
          connect: data.subcategoriaIds.map((id) => ({ id })),
        },
      },
      include: { subcategorias: true },
    });
  }

  async update(id: number, data: UpdateProductoDto) {
    const updateData: any = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      marca_id: data.marca_id,
      foto: data.foto,
    };
    if (data.subcategoriaIds) {
      await this.prisma.$transaction([
        this.prisma.productos.update({
          where: { id },
          data: {
            subcategorias: {
              set: [],
            },
          },
        }),
        this.prisma.productos.update({
          where: { id },
          data: {
            subcategorias: {
              connect: data.subcategoriaIds.map((id) => ({ id })),
            },
            ...updateData,
          },
        }),
      ]);
      return this.findOne(id);
    }
    return this.prisma.productos.update({
      where: { id },
      data: updateData,
      include: { subcategorias: true },
    });
  }

  remove(id: number) {
    return this.prisma.productos.delete({ where: { id } });
  }
}
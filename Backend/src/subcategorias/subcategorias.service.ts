import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';

@Injectable()
export class SubcategoriasService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.subcategorias.findMany({
      include: { categorias: true },
    });
  }

  findOne(id: number) {
    return this.prisma.subcategorias.findUnique({
      where: { id },
      include: { categorias: true },
    });
  }

  async create(data: CreateSubcategoriaDto) {
    // Guardar la subcategoría y asociar categorías
    return this.prisma.subcategorias.create({
      data: {
        subcategoria: data.subcategoria,
        descripcion: data.descripcion,
        foto: data.foto,
        categorias: {
          connect: data.categoriaIds.map((id) => ({ id })),
        },
      },
      include: { categorias: true },
    });
  }

  async update(id: number, data: UpdateSubcategoriaDto) {
    const updateData: any = {
      subcategoria: data.subcategoria,
      descripcion: data.descripcion,
      foto: data.foto,
    };
    // Manejo de categoría muchas a muchas
    if (data.categoriaIds) {
      // Desconecta todas primero, luego conecta las nuevas
      await this.prisma.$transaction([
        this.prisma.subcategorias.update({
          where: { id },
          data: {
            categorias: {
              set: [],
            },
          },
        }),
        this.prisma.subcategorias.update({
          where: { id },
          data: {
            categorias: {
              connect: data.categoriaIds.map((id) => ({ id })),
            },
            ...updateData,
          },
        }),
      ]);
      return this.findOne(id);
    }
    return this.prisma.subcategorias.update({
      where: { id },
      data: updateData,
      include: { categorias: true },
    });
  }

  remove(id: number) {
    return this.prisma.subcategorias.delete({ where: { id } });
  }

  async findCategoriasBySubcategoria(id: number) {
    return this.prisma.subcategorias.findUnique({
      where: { id },
      include: { categorias: true },
    }).then(subcategoria => subcategoria?.categorias || []);
  }
}
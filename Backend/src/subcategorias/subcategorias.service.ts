import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';

@Injectable()
export class SubcategoriasService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    
    const where = query 
      ? {
          OR: [
            { subcategoria: { contains: query, mode: 'insensitive' as any } },
            { descripcion: { contains: query, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [subcategorias, total] = await Promise.all([
      this.prisma.subcategorias.findMany({
        where,
        include: {
          categorias: {
            select: { id: true, categoria: true }
          },
          productos: {
            select: { id: true, nombre: true }
          }
        },
        orderBy: { subcategoria: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.subcategorias.count({ where }),
    ]);

    return {
      data: subcategorias,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID inválido');
    }

    const subcategoria = await this.prisma.subcategorias.findUnique({
      where: { id },
      include: {
        categorias: {
          select: { 
            id: true, 
            categoria: true, 
            descripcion: true 
          }
        },
        productos: {
          select: { 
            id: true, 
            nombre: true, 
            descripcion: true,
            foto: true,
            marca: {
              select: { id: true, marca: true }
            }
          }
        }
      },
    });

    if (!subcategoria) {
      throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
    }

    return subcategoria;
  }

  async findProductosBySubcategoria(id: number, query?: string) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID inválido');
    }

    const subcategoria = await this.prisma.subcategorias.findUnique({
      where: { id },
      include: {
        productos: {
          where: query
            ? {
                OR: [
                  { nombre: { contains: query, 
                    //mode: 'insensitive' as any 
                  } },
                  { descripcion: { contains: query, 
                    //mode: 'insensitive' as any 
                  } },
                ],
              }
            : undefined,
          include: {
            marca: {
              select: { id: true, marca: true }
            },
            stock: {
              select: {
                id: true,
                cantidad: true,
                precio_venta: true,
                color: { select: { id: true, nombre: true } },
                talla: { select: { id: true, nombre: true } }
              }
            }
          },
          orderBy: { nombre: 'asc' },
        },
      },
    });

    if (!subcategoria) {
      throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
    }

    return subcategoria.productos; ////////// ERROR AQUI //////////
  }

  async create(data: CreateSubcategoriaDto) {
    // Verificar unicidad que en la misma categoría no exista otra subcategoría con el mismo nombre
    const existing = await this.prisma.subcategorias.findFirst({
      where: {
        subcategoria: { equals: data.subcategoria.trim() },
        categorias: {
          some: { id: { in: data.categoriaIds } }
        }
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una subcategoría con el nombre "${data.subcategoria}"`
      );
    }

    // Verificar que todas las categorías existen
    const categorias = await this.prisma.categorias.findMany({
      where: { id: { in: data.categoriaIds } },
    });

    if (categorias.length !== data.categoriaIds.length) {
      throw new BadRequestException('Una o más categorías no existen');
    }

    return this.prisma.subcategorias.create({
      data: {
        subcategoria: data.subcategoria.trim(),
        descripcion: data.descripcion?.trim(),
        foto: data.foto,
        categorias: {
          connect: data.categoriaIds.map(id => ({ id })),
        },
      },
      include: {
        categorias: {
          select: { id: true, categoria: true }
        }
      },
    });
  }

  async update(id: number, data: UpdateSubcategoriaDto) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID inválido');
    }

    const existing = await this.prisma.subcategorias.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
    }

    // Verificar unicidad del nombre si se está cambiando
    if (data.subcategoria && data.subcategoria.trim() !== existing.subcategoria) {
      const duplicate = await this.prisma.subcategorias.findFirst({
        where: {
          subcategoria: { 
            equals: data.subcategoria.trim(), 
            //mode: 'insensitive' as any 
          },
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Ya existe otra subcategoría con el nombre "${data.subcategoria}"`
        );
      }
    }

    // Verificar categorías si se están actualizando
    if (data.categoriaIds) {
      const categorias = await this.prisma.categorias.findMany({
        where: { id: { in: data.categoriaIds } },
      });

      if (categorias.length !== data.categoriaIds.length) {
        throw new BadRequestException('Una o más categorías no existen');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (data.subcategoria) updateData.subcategoria = data.subcategoria.trim();
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion?.trim();
      if (data.foto) updateData.foto = data.foto;

      // Si se actualizan las categorías, primero desconectar todas
      if (data.categoriaIds) {
        await tx.subcategorias.update({
          where: { id },
          data: {
            categorias: {
              set: [], // Desconectar todas
            },
          },
        });
      }

      // Actualizar con las nuevas categorías
      return tx.subcategorias.update({
        where: { id },
        data: {
          ...updateData,
          ...(data.categoriaIds && {
            categorias: {
              connect: data.categoriaIds.map(catId => ({ id: catId })),
            },
          }),
        },
        include: {
          categorias: {
            select: { id: true, categoria: true }
          }
        },
      });
    });
  }

  async findCategoriasBySubcategoria(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID inválido');
    }

    const subcategoria = await this.prisma.subcategorias.findUnique({
      where: { id },
      include: {
        categorias: true,
      },
    });

    if (!subcategoria) {
      throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
    }

    return subcategoria.categorias;
  }
}
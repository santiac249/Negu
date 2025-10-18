import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  // Búsqueda con paginación y filtros
  async findAll(query?: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    
    const where = query 
      ? {
          OR: [
            { categoria: { contains: query, mode: 'insensitive' as any } },
            { descripcion: { contains: query, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [categorias, total] = await Promise.all([
      this.prisma.categorias.findMany({
        where,
        include: {
          subcategorias: {
            select: { id: true, subcategoria: true }
          }
        },
        orderBy: { categoria: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.categorias.count({ where }),
    ]);

    return {
      data: categorias,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    // Validar entrada
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID inválido');
    }

    const categoria = await this.prisma.categorias.findUnique({
      where: { id },
      include: {
        subcategorias: {
          select: { 
            id: true, 
            subcategoria: true, 
            descripcion: true,
            foto: true 
          }
        }
      },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return categoria;
  }

  async findSubcategoriasByCategoria(id: number, query?: string) {
    // Validar entrada
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID inválido');
    }

    const categoria = await this.prisma.categorias.findUnique({
      where: { id },
      include: {
        subcategorias: {
          where: query
            ? {
                OR: [
                  { subcategoria: { contains: query, 
                    //mode: 'insensitive' as any 
                  } },
                  { descripcion: { contains: query, 
                    //mode: 'insensitive' as any 
                  } },
                ],
              }
            : undefined,
          include: {
            productos: {
              select: { id: true }
            }
          },
          orderBy: { subcategoria: 'asc' },
        },
      },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return categoria.subcategorias;
  }

  async create(data: CreateCategoriaDto) {
    // Verificar unicidad del nombre
    const existing = await this.prisma.categorias.findFirst({
      where: { 
        categoria: { 
          equals: data.categoria.trim(), 
          //mode: 'insensitive' as any 
        } 
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una categoría con el nombre "${data.categoria}"`
      );
    }

    return this.prisma.categorias.create({
      data: {
        categoria: data.categoria.trim(),
        descripcion: data.descripcion?.trim(),
        foto: data.foto,
      },
      include: {
        subcategorias: {
          select: { id: true, subcategoria: true }
        }
      },
    });
  }

  async update(id: number, data: UpdateCategoriaDto) {
    // Validar entrada
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID inválido');
    }

    // Verificar existencia
    const existing = await this.prisma.categorias.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    // Verificar unicidad del nombre si se está cambiando
    if (data.categoria && data.categoria.trim() !== existing.categoria) {
      const duplicate = await this.prisma.categorias.findFirst({
        where: {
          categoria: { 
            equals: data.categoria.trim(), 
            //mode: 'insensitive' as any 
          },
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Ya existe otra categoría con el nombre "${data.categoria}"`
        );
      }
    }

    const updateData: any = {};
    if (data.categoria) updateData.categoria = data.categoria.trim();
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion?.trim();
    if (data.foto) updateData.foto = data.foto;

    return this.prisma.categorias.update({
      where: { id },
      data: updateData,
      include: {
        subcategorias: {
          select: { id: true, subcategoria: true }
        }
      },
    });
  }

  // Ya no eliminar, pero dejo el método comentado por si acaso
  /*
  async remove(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID inválido');
    }

    const categoria = await this.prisma.categorias.findUnique({
      where: { id },
      include: { subcategorias: true },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    if (categoria.subcategorias.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoría que tiene subcategorías asociadas'
      );
    }

    return this.prisma.categorias.delete({ where: { id } });
  }
  */
}
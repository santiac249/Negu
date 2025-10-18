import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    
    const where = query 
      ? {
          OR: [
            { nombre: { contains: query, mode: 'insensitive' as any } },
            { descripcion: { contains: query, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [productos, total] = await Promise.all([
      this.prisma.productos.findMany({
        where,
        include: {
          marca: {
            select: { id: true, marca: true }
          },
          subcategorias: {
            select: { id: true, subcategoria: true }
          },
          stock: {
            select: {
              id: true,
              cantidad: true,
              precio_venta: true,
            },
            take: 1, // Solo un ejemplo de stock
          }
        },
        orderBy: { nombre: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.productos.count({ where }),
    ]);

    return {
      data: productos,
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

    const producto = await this.prisma.productos.findUnique({
      where: { id },
      include: {
        marca: true,
        subcategorias: {
          include: {
            categorias: {
              select: { id: true, categoria: true }
            }
          }
        },
        stock: {
          include: {
            color: true,
            talla: true,
          }
        }
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async findStockByProducto(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID inválido');
    }

    const producto = await this.prisma.productos.findUnique({
      where: { id },
      include: {
        stock: {
          include: {
            color: true,
            talla: true,
          },
          orderBy: [
            { color: { nombre: 'asc' } },
            { talla: { nombre: 'asc' } },
          ],
        },
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return {
      producto: {
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        foto: producto.foto,
      },
      stock: producto.stock,
      resumen: {
        totalVariantes: producto.stock.length,
        stockTotal: producto.stock.reduce((sum, s) => sum + s.cantidad, 0),
      },
    };
  }

  async create(data: CreateProductoDto) {
    // Verificar que la marca existe
    const marca = await this.prisma.marcas.findUnique({
      where: { id: data.marca_id },
    });

    if (!marca) {
      throw new NotFoundException(`Marca con ID ${data.marca_id} no encontrada`);
    }

    // Verificar que todas las subcategorías existen
    const subcategorias = await this.prisma.subcategorias.findMany({
      where: { id: { in: data.subcategoriaIds } },
    });

    if (subcategorias.length !== data.subcategoriaIds.length) {
      throw new BadRequestException('Una o más subcategorías no existen');
    }

    // Verificar unicidad del nombre (opcional, según tu lógica de negocio)
    const existing = await this.prisma.productos.findFirst({
      where: { 
        nombre: { 
          equals: data.nombre.trim(), 
          //mode: 'insensitive' as any 
        } 
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un producto con el nombre "${data.nombre}"`
      );
    }

    return this.prisma.productos.create({
      data: {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim(),
        marca_id: data.marca_id,
        foto: data.foto,
        subcategorias: {
          connect: data.subcategoriaIds.map(id => ({ id })),
        },
      },
      include: {
        marca: {
          select: { id: true, marca: true }
        },
        subcategorias: {
          select: { id: true, subcategoria: true }
        }
      },
    });
  }

  async update(id: number, data: UpdateProductoDto) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID inválido');
    }

    const existing = await this.prisma.productos.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // Verificar marca si se está actualizando
    if (data.marca_id) {
      const marca = await this.prisma.marcas.findUnique({
        where: { id: data.marca_id },
      });

      if (!marca) {
        throw new NotFoundException(`Marca con ID ${data.marca_id} no encontrada`);
      }
    }

    // Verificar subcategorías si se están actualizando
    if (data.subcategoriaIds) {
      const subcategorias = await this.prisma.subcategorias.findMany({
        where: { id: { in: data.subcategoriaIds } },
      });

      if (subcategorias.length !== data.subcategoriaIds.length) {
        throw new BadRequestException('Una o más subcategorías no existen');
      }
    }

    // Verificar unicidad del nombre si se está cambiando
    if (data.nombre && data.nombre.trim() !== existing.nombre) {
      const duplicate = await this.prisma.productos.findFirst({
        where: {
          nombre: { 
            equals: data.nombre.trim(), 
            //mode: 'insensitive' as any 
          },
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Ya existe otro producto con el nombre "${data.nombre}"`
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (data.nombre) updateData.nombre = data.nombre.trim();
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion?.trim();
      if (data.marca_id) updateData.marca_id = data.marca_id;
      if (data.foto) updateData.foto = data.foto;

      // Si se actualizan las subcategorías, primero desconectar todas
      if (data.subcategoriaIds) {
        await tx.productos.update({
          where: { id },
          data: {
            subcategorias: {
              set: [], // Desconectar todas
            },
          },
        });
      }

      // Actualizar con las nuevas subcategorías
      return tx.productos.update({
        where: { id },
        data: {
          ...updateData,
          ...(data.subcategoriaIds && {
            subcategorias: {
              connect: data.subcategoriaIds.map(subId => ({ id: subId })),
            },
          }),
        },
        include: {
          marca: {
            select: { id: true, marca: true }
          },
          subcategorias: {
            select: { id: true, subcategoria: true }
          }
        },
      });
    });
  }
}
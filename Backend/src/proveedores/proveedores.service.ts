import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.proveedores.findMany();
  }

  findOne(id: number) {
    return this.prisma.proveedores.findUnique({ where: { id } });
  }

  create(data: CreateProveedorDto) {
    return this.prisma.proveedores.create({ data });
  }

  update(id: number, data: UpdateProveedorDto) {
    return this.prisma.proveedores.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.proveedores.delete({ where: { id } });
  }
}
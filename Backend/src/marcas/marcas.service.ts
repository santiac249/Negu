import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

@Injectable()
export class MarcasService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.marcas.findMany();
  }

  findOne(id: number) {
    return this.prisma.marcas.findUnique({
      where: { id }
    });
  }

  findByName(marca: string) {
    return this.prisma.marcas.findUnique({
      where: { marca }
    });
  }

  async create(data: CreateMarcaDto) {
    return this.prisma.marcas.create({
      data: {
        marca: data.marca,
        foto: data.foto,
        //...(data.foto && { foto: data.foto }),

      }
    });
  }

  async update(id: number, data: UpdateMarcaDto) {
    const updateData: any = {
      marca: data.marca,
      foto: data.foto,
    };
    return this.prisma.marcas.update({
      where: { id },
      data: updateData
    });
  }

  remove(id: number) {
    return this.prisma.marcas.delete({ where: { id } });
  }
}
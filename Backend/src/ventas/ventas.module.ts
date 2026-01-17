import { Module } from '@nestjs/common';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VentasController],
  providers: [VentasService, PrismaService],
  exports: [VentasService],
})
export class VentasModule {}

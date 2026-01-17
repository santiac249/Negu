import { Module } from '@nestjs/common';
import { GastosController } from './gastos.controller';
import { GastosService } from './gastos.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [GastosController],
  providers: [GastosService, PrismaService],
  exports: [GastosService],
})
export class GastosModule {}

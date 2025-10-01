import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService],
  imports: [PrismaModule],
  exports: [ProductosService],
})
export class ProductosModule {}
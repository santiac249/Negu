import { Module } from '@nestjs/common';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [CategoriasController],
  providers: [CategoriasService],
  imports: [PrismaModule],
  exports: [CategoriasService],
})
export class CategoriasModule {}
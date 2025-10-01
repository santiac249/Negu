import { Module } from '@nestjs/common';
import { SubcategoriasController } from './subcategorias.controller';
import { SubcategoriasService } from './subcategorias.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [SubcategoriasController],
  providers: [SubcategoriasService],
  imports: [PrismaModule],
  exports: [SubcategoriasService],
})
export class SubcategoriasModule {}
import { Module } from '@nestjs/common';
import { MarcasController } from './marcas.controller';
import { MarcasService } from './marcas.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [MarcasController],
  providers: [MarcasService],
  imports: [PrismaModule],
  exports: [MarcasService],
})
export class MarcasModule {}
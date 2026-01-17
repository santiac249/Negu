import { Module } from '@nestjs/common';
import { GastosService } from './gastos.service';
import { GastosController } from './gastos.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [GastosController],
  providers: [GastosService],
  exports: [GastosService],
  imports: [PrismaModule],
})
export class GastosModule {}
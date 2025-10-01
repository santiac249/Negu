import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  imports: [PrismaModule],
  exports: [UsuariosService],
})
export class UsuariosModule {}

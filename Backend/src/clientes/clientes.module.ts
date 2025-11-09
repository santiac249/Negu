import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsuariosService } from 'src/usuarios/usuarios.service';


@Module({
  controllers: [ClientesController],
  providers: [ClientesService],
  imports: [PrismaModule],
  exports: [ClientesService],
})
export class ClientesModule {}

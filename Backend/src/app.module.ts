import { Module } from '@nestjs/common';
import { RolesModule } from './roles/roles.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { SubcategoriasModule } from './subcategorias/subcategorias.module';
import { MarcasModule } from './marcas/marcas.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { StockModule } from './stock/stock.module';
import { ComprasModule } from './compras/compras.module';
import { PlanSepareModule } from './plan-separe/plan-separe.module';
import { ClientesModule } from './clientes/clientes.module';
import { ClientesController } from './clientes/clientes.controller';
import { GastosController } from './gastos/gastos.controller';
import { GastosService } from './gastos/gastos.service';
import { GastosModule } from './gastos/gastos.module';

@Module({
  imports: [
    RolesModule,
    UsuariosModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ProductosModule,
    CategoriasModule,
    SubcategoriasModule,
    MarcasModule,
    ProveedoresModule,
    StockModule,
    ComprasModule,
    PlanSepareModule,
    ClientesModule,
    GastosModule,
  ],
  controllers: [ClientesController, GastosController],
  providers: [GastosService],
  // No declare servicios ni controladores aquí que ya estén en módulos importados
})
export class AppModule {}

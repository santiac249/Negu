import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
    findAll() {
    return this.comprasService.findAll();
}


  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Post()
  create(@Body() createCompraDto: CreateCompraDto) {
    return this.comprasService.create(createCompraDto);
  }
}

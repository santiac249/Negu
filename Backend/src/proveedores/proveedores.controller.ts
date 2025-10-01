import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.proveedoresService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proveedoresService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Post()
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedoresService.create(createProveedorDto);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Put(':id')
  update(@Param('id') id: string, @Body() updateProveedorDto: UpdateProveedorDto) {
    return this.proveedoresService.update(+id, updateProveedorDto);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proveedoresService.remove(+id);
  }
}
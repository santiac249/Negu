import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GastosService } from './gastos.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { FilterGastoDto } from './dto/filter-gasto.dto';

@Controller('gastos')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  /**
   * Obtener todos los gastos con filtros y paginación
   * GET /gastos?page=1&limit=10&tipo=Operativo&fechaInicio=2026-01-01&fechaFin=2026-01-31
   */
  @Get()
  findAll(@Query(new ValidationPipe({ transform: true })) filter: FilterGastoDto) {
    return this.gastosService.findAll(filter);
  }

  /**
   * Obtener resumen de gastos por tipo
   * GET /gastos/resumen/por-tipo
   */
  @Get('resumen/por-tipo')
  getResumenPorTipo() {
    return this.gastosService.getResumenPorTipo();
  }

  /**
   * Obtener gastos por período
   * GET /gastos/periodo?fechaInicio=2026-01-01&fechaFin=2026-01-31
   */
  @Get('periodo')
  getGastosPorPeriodo(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new Error('Debe proporcionar fechaInicio y fechaFin');
    }
    return this.gastosService.getGastosPorPeriodo(
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  /**
   * Obtener total de gastos en un período
   * GET /gastos/total-periodo?fechaInicio=2026-01-01&fechaFin=2026-01-31
   */
  @Get('total-periodo')
  getTotalGastosPeriodo(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new Error('Debe proporcionar fechaInicio y fechaFin');
    }
    return this.gastosService.getTotalGastosPeriodo(
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  /**
   * Obtener un gasto por ID
   * GET /gastos/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gastosService.findOne(id);
  }

  /**
   * Crear un nuevo gasto
   * POST /gastos
   */
  @Post()
  create(@Body(ValidationPipe) createGastoDto: CreateGastoDto) {
    return this.gastosService.create(createGastoDto);
  }

  /**
   * Actualizar un gasto
   * PUT /gastos/:id
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateGastoDto: UpdateGastoDto,
  ) {
    return this.gastosService.update(id, updateGastoDto);
  }

  /**
   * Eliminar un gasto
   * DELETE /gastos/:id
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gastosService.remove(id);
  }
}

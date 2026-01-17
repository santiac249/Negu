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
  ValidationPipe,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { FilterVentaDto } from './dto/filter-venta.dto';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  /**
   * Obtener todas las ventas con filtros y paginación
   * GET /ventas?page=1&limit=10&clienteId=1&estado=Completada&fechaInicio=2026-01-01&fechaFin=2026-01-31
   */
  @Get()
  findAll(@Query(new ValidationPipe({ transform: true })) filter: FilterVentaDto) {
    return this.ventasService.findAll(filter);
  }

  /**
   * Obtener ventas por período
   * GET /ventas/periodo?fechaInicio=2026-01-01&fechaFin=2026-01-31
   */
  @Get('periodo')
  getVentasPorPeriodo(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new Error('Debe proporcionar fechaInicio y fechaFin');
    }
    return this.ventasService.getVentasPorPeriodo(
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  /**
   * Obtener total de ventas en un período
   * GET /ventas/total-periodo?fechaInicio=2026-01-01&fechaFin=2026-01-31
   */
  @Get('total-periodo')
  getTotalVentasPeriodo(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new Error('Debe proporcionar fechaInicio y fechaFin');
    }
    return this.ventasService.getTotalVentasPeriodo(
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  /**
   * Obtener top 10 productos más vendidos
   * GET /ventas/analisis/productos-top
   */
  @Get('analisis/productos-top')
  getProductosMasVendidos(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.ventasService.getProductosMasVendidos(limit || 10);
  }

  /**
   * Obtener resumen de ventas por método de pago
   * GET /ventas/analisis/resumen-metodo-pago
   */
  @Get('analisis/resumen-metodo-pago')
  getResumenPorMetodoPago() {
    return this.ventasService.getResumenPorMetodoPago();
  }

  /**
   * Obtener ventas de un cliente
   * GET /ventas/cliente/:clienteId
   */
  @Get('cliente/:clienteId')
  getVentasPorCliente(
    @Param('clienteId', ParseIntPipe) clienteId: number,
  ) {
    return this.ventasService.getVentasPorCliente(clienteId);
  }

  /**
   * Obtener una venta por ID
   * GET /ventas/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.findOne(id);
  }

  /**
   * Crear una nueva venta
   * POST /ventas
   */
  @Post()
  create(@Body(ValidationPipe) createVentaDto: CreateVentaDto) {
    return this.ventasService.create(createVentaDto);
  }

  /**
   * Actualizar una venta
   * PUT /ventas/:id
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateVentaDto: UpdateVentaDto,
  ) {
    return this.ventasService.update(id, updateVentaDto);
  }

  /**
   * Cancelar una venta (revertir stock)
   * DELETE /ventas/:id
   */
  @Delete(':id')
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.cancelar(id);
  }
}

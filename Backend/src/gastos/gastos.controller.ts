import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { GastosService } from './gastos.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { CreateGastoRecurrenteDto } from './dto/create-gasto-recurrente.dto';
import { UpdateGastoRecurrenteDto } from './dto/update-gasto-recurrente.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';

interface UserPayload {
  sub: number;
  usuario: string;
  rol_id: number;
  rol: string;
}

@Controller('gastos')
@UseGuards(JwtAuthGuard)
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  // ==================== GASTOS ====================

  @Get()
  async findAll(
    @Query('tipo') tipo?: string,
    @Query('proveedorId', new ParseIntPipe({ optional: true })) proveedorId?: number,
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
  ) {
    return await this.gastosService.findAll({
      tipo,
      proveedorId,
      fecha_inicio,
      fecha_fin,
    });
  }

  @Get('resumen')
  async getSummary(
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
  ) {
    return await this.gastosService.getSummary(fecha_inicio, fecha_fin);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.gastosService.findOne(id);
  }

  @Post()
  async create(
    @CurrentUser() user: UserPayload,
    @Body() createGastoDto: CreateGastoDto,
  ) {
    return await this.gastosService.create(user.sub, createGastoDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
    @Body() updateGastoDto: UpdateGastoDto,
  ) {
    return await this.gastosService.update(id, user.sub, user.rol, updateGastoDto);
  }

  // ==================== GASTOS RECURRENTES ====================

  @Get('recurrentes')
  async findAllRecurrentes() {
    return await this.gastosService.findAllRecurrentes();
  }

  @Get('recurrentes/:id')
  async findOneRecurrente(@Param('id', ParseIntPipe) id: number) {
    return await this.gastosService.findOneRecurrente(id);
  }

  @Post('recurrentes')
  async createRecurrente(
    @CurrentUser() user: UserPayload,
    @Body() createGastoRecurrenteDto: CreateGastoRecurrenteDto,
  ) {
    return await this.gastosService.createRecurrente(user.sub, createGastoRecurrenteDto);
  }

  @Put('recurrentes/:id')
  async updateRecurrente(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
    @Body() updateGastoRecurrenteDto: UpdateGastoRecurrenteDto,
  ) {
    return await this.gastosService.updateRecurrente(id, user.rol, updateGastoRecurrenteDto);
  }

  @Post('recurrentes/:id/toggle')
  async toggleRecurrente(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
    @Body('activo') activo: boolean,
  ) {
    return await this.gastosService.toggleRecurrente(id, user.rol, activo);
  }

  @Post('recurrentes/:id/generar')
  async generarProximoPeriodo(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
  ) {
    return await this.gastosService.generarProximoPeriodo(id);
  }
}
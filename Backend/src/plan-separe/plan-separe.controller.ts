import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PlanSepareService } from './plan-separe.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreatePlanSepareDto } from './dto/create-plan-separe.dto';
import { UpdatePlanSepareDto } from './dto/update-plan-separe.dto';
import { CreateAbonoPlanSepareDto } from './dto/create-abono-plan-separe.dto';

@Controller('plan-separe')
@UseGuards(JwtAuthGuard)
export class PlanSepareController {
  constructor(private readonly planSepareService: PlanSepareService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPlanSepareDto: CreatePlanSepareDto) {
    return this.planSepareService.create(createPlanSepareDto);
  }

  @Post(':id/abonos')
  @HttpCode(HttpStatus.CREATED)
  createAbono(
    @Param('id', ParseIntPipe) planSepareId: number,
    @Body() createAbonoDto: CreateAbonoPlanSepareDto
  ) {
    return this.planSepareService.createAbono({
      ...createAbonoDto,
      planSepareId,
    });
  }

  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.planSepareService.findAll(estado);
  }

  @Get('activos')
  findActivos() {
    return this.planSepareService.findAll('Activo');
  }

  @Get('vencidos')
  findVencidos() {
    return this.planSepareService.findVencidos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.planSepareService.findOne(id);
  }

  @Get(':id/abonos')
  findAbonos(@Param('id', ParseIntPipe) id: number) {
    return this.planSepareService.findAbonos(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updatePlanSepareDto: UpdatePlanSepareDto
  ) {
    return this.planSepareService.update(id, updatePlanSepareDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.planSepareService.remove(id);
  }
}
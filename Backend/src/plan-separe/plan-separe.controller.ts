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
} from '@nestjs/common';
import { PlanSepareService } from './plan-separe.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreatePlanSepareDto } from './dto/create-plan-separe.dto';

@Controller('plan-separe')
@UseGuards(JwtAuthGuard)
export class PlanSepareController {
  constructor(private readonly planSepareService: PlanSepareService) {}

  @Post()
  create(@Body() createPlanSepareDto: CreatePlanSepareDto) {
    return this.planSepareService.create(createPlanSepareDto);
  }

  @Get()
  findAll() {
    return this.planSepareService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.planSepareService.findOne(id);
  }

  @Get('/cliente/nombre/:nombre')
  findOneByNombreCliente(@Param('nombre') nombre: string) {
    return this.planSepareService.findOneByNombreCliente(nombre);
  }

  @Get('/cliente/cedula/:cedula')
  findOneByCedulaCliente(@Param('cedula') cedula: string) {
    return this.planSepareService.findOneByCedulaCliente(cedula);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<CreatePlanSepareDto>) {
    return this.planSepareService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.planSepareService.remove(id);
  }
}

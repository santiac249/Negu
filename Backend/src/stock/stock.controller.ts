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
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Query, ParseIntPipe } from '@nestjs/common';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.stockService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(+id);
  }

  @Get('producto/:productoId')
  @UseGuards(JwtAuthGuard)
  findStockByProducto(
    @Param('productoId', ParseIntPipe) productoId: number,
    @Query('order') order: 'asc' | 'desc' = 'asc',
    @Query('colorId') colorId?: number,
    @Query('tallaId') tallaId?: number,
    ) {
    const options = {
        order,
        colorId: colorId ? Number(colorId) : undefined,
        tallaId: tallaId ? Number(tallaId) : undefined,
    };

    return this.stockService.findStockByProducto(productoId, options);
    }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Put(':id')
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.stockService.update(+id, updateStockDto);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.remove(+id);
  }
}
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Post()
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/fotos/productos',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  create(@UploadedFile() foto: Express.Multer.File, @Body() createDto: CreateProductoDto) {
    if (foto) {
      createDto.foto = foto.filename;
    }
    return this.productosService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/fotos/productos',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  update(@Param('id') id: string, @UploadedFile() foto: Express.Multer.File, @Body() updateDto: UpdateProductoDto) {
    if (foto) {
      updateDto.foto = foto.filename;
    }
    return this.productosService.update(+id, updateDto);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(+id);
  }
}
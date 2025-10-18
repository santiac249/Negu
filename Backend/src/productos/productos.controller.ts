import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
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
@UseGuards(JwtAuthGuard)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  findAll(
    @Query('q') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.productosService.findAll(query, pageNum, limitNum);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @Get(':id/stock')
  findStock(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findStockByProducto(id);
  }

  @Post()
  @UseGuards(new RolesGuard(['Administrador']))
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
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se permiten imágenes (JPG, PNG, WEBP)'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  create(
    @UploadedFile() foto: Express.Multer.File,
    @Body() createDto: CreateProductoDto,
  ) {
    if (foto) {
      createDto.foto = foto.filename;
    }
    return this.productosService.create(createDto);
  }

  @Put(':id')
  @UseGuards(new RolesGuard(['Administrador']))
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
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se permiten imágenes (JPG, PNG, WEBP)'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() foto: Express.Multer.File,
    @Body() updateDto: UpdateProductoDto,
  ) {
    if (foto) {
      updateDto.foto = foto.filename;
    }
    return this.productosService.update(id, updateDto);
  }
}
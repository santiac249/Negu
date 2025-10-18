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
import { SubcategoriasService } from './subcategorias.service';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('subcategorias')
@UseGuards(JwtAuthGuard)
export class SubcategoriasController {
  constructor(private readonly subcategoriasService: SubcategoriasService) {}

  @Get()
  findAll(
    @Query('q') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.subcategoriasService.findAll(query, pageNum, limitNum);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subcategoriasService.findOne(id);
  }

  @Get(':id/productos')
  findProductos(
    @Param('id', ParseIntPipe) id: number,
    @Query('q') query?: string,
  ) {
    return this.subcategoriasService.findProductosBySubcategoria(id, query);
  }

  @Get(':id/categorias')
  findCategorias(@Param('id', ParseIntPipe) id: number) {
    return this.subcategoriasService.findCategoriasBySubcategoria(id);
  }

  @Post()
  @UseGuards(new RolesGuard(['Administrador']))
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/fotos/subcategorias',
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
    @Body() createDto: CreateSubcategoriaDto,
  ) {
    if (foto) {
      createDto.foto = foto.filename;
    }
    return this.subcategoriasService.create(createDto);
  }

  @Put(':id')
  @UseGuards(new RolesGuard(['Administrador']))
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/fotos/subcategorias',
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
    @Body() updateDto: UpdateSubcategoriaDto,
  ) {
    if (foto) {
      updateDto.foto = foto.filename;
    }
    return this.subcategoriasService.update(id, updateDto);
  }
}
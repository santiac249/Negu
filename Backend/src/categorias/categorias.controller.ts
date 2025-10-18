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
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('categorias')
@UseGuards(JwtAuthGuard)
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  findAll(
    @Query('q') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.categoriasService.findAll(query, pageNum, limitNum);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  @Get(':id/subcategorias')
  findSubcategorias(
    @Param('id', ParseIntPipe) id: number,
    @Query('q') query?: string,
  ) {
    return this.categoriasService.findSubcategoriasByCategoria(id, query);
  }

  @Post()
  @UseGuards(new RolesGuard(['Administrador']))
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/fotos/categorias',
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
        fileSize: 5 * 1024 * 1024, // 5MB máximo
      },
    }),
  )
  create(
    @UploadedFile() foto: Express.Multer.File,
    @Body() createDto: CreateCategoriaDto,
  ) {
    if (foto) {
      createDto.foto = foto.filename;
    }
    return this.categoriasService.create(createDto);
  }

  @Put(':id')
  @UseGuards(new RolesGuard(['Administrador']))
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/fotos/categorias',
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
    @Body() updateDto: UpdateCategoriaDto,
  ) {
    if (foto) {
      updateDto.foto = foto.filename;
    }
    return this.categoriasService.update(id, updateDto);
  }
}
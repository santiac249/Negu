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
import { SubcategoriasService } from './subcategorias.service';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('subcategorias')
export class SubcategoriasController {
  constructor(private readonly subcategoriasService: SubcategoriasService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.subcategoriasService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcategoriasService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Post()
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
    }),
  )
  create(@UploadedFile() foto: Express.Multer.File, @Body() createDto: CreateSubcategoriaDto) {
    if (foto) {
      createDto.foto = foto.filename;
    }
    return this.subcategoriasService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Put(':id')
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
    }),
  )
  update(@Param('id') id: string, @UploadedFile() foto: Express.Multer.File, @Body() updateDto: UpdateSubcategoriaDto) {
    if (foto) {
      updateDto.foto = foto.filename;
    }
    return this.subcategoriasService.update(+id, updateDto);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subcategoriasService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/categorias')
  findCategorias(@Param('id') id: string) {
    return this.subcategoriasService.findCategoriasBySubcategoria(+id);
  }
}
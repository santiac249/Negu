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
  BadRequestException,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../guards/roles.guard'; // implementa según te expliqué antes
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Post()
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
    }),
  )
  create(@UploadedFile() foto: Express.Multer.File, @Body() createDto: CreateCategoriaDto) {
    if (foto) {
      createDto.foto = foto.filename;
    }
    return this.categoriasService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Put(':id')
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
    }),
  )
  update(@Param('id') id: string, @UploadedFile() foto: Express.Multer.File, @Body() updateDto: UpdateCategoriaDto) {
    if (foto) {
      updateDto.foto = foto.filename;
    }
    return this.categoriasService.update(+id, updateDto);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard(['Administrador']))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriasService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/subcategorias')
  findSubcategorias(@Param('id') id: string) {
    return this.categoriasService.findSubcategoriasByCategoria(+id);
}
}
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
//import { File as MulterFile } from 'multer';
import { extname } from 'path';

import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/fotos/usuarios',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  create(
    @UploadedFile() foto: Express.Multer.File,
    @Body() createUsuarioDto: CreateUsuarioDto,
  ) {
    // ✅ Conversión segura de rol_id
    const rolIdNumber = Number(createUsuarioDto.rol_id);
    if (isNaN(rolIdNumber)) {
      throw new BadRequestException('El campo rol_id debe ser un número válido');
    }
    createUsuarioDto.rol_id = rolIdNumber;

    if (foto) {
      createUsuarioDto.foto = foto.filename;
    }

    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':cedula')
  findByCedula(@Param('cedula') cedula: string) {
    return this.usuariosService.findByCedula(cedula);
  }

  @Get('usuario/:usuario')
  findByUsuario(@Param('usuario') usuario: string) {
    return this.usuariosService.findByUsuario(usuario);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/fotos/usuarios',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFile() foto: Express.Multer.File,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    // ✅ Conversión segura de rol_id si viene en la petición
    if (updateUsuarioDto.rol_id !== undefined) {
      const rolIdNumber = Number(updateUsuarioDto.rol_id);
      if (isNaN(rolIdNumber)) {
        throw new BadRequestException('El campo rol_id debe ser un número válido');
      }
      updateUsuarioDto.rol_id = rolIdNumber;
    }

    if (foto) {
      updateUsuarioDto.foto = foto.filename;
    }

    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}

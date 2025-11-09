// src/clientes/clientes.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
//import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Configuración de almacenamiento de archivos
const clientesFotoStorage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/fotos/clientes');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `cliente-${uniqueSuffix}${ext}`);
  },
});

// Validador de archivo
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(file.mimetype)) {
    cb(
      new BadRequestException('Solo se aceptan archivos JPEG, PNG o WebP'),
      false,
    );
  } else {
    cb(null, true);
  }
};

@Controller('clientes')
//@UseGuards(JwtAuthGuard) // Todas las rutas requieren JWT
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  /**
   * Obtener listado de clientes con búsqueda opcional
   * @param q - Texto de búsqueda (opcional): nombre, documento, correo, teléfono
   * @returns Array de clientes con conteo de planes activos
   */
  @Get()
  async findAll(@Query('q') query?: string) {
    return await this.clientesService.findAll(query);
  }

  /**
   * Obtener detalles completos de un cliente por ID
   * @param id - ID del cliente
   * @returns Datos del cliente con ventas y planes asociados
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.clientesService.findOne(id);
  }

  /**
   * Crear nuevo cliente con validaciones
   * @param createClienteDto - Datos del cliente
   * @param file - Foto del cliente (opcional)
   * @returns Cliente creado
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: clientesFotoStorage,
      fileFilter: fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async create(
    @Body() createClienteDto: CreateClienteDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = {
      ...createClienteDto,
      foto: file ? file.filename : undefined,
    };
    return await this.clientesService.create(data);
  }

  /**
   * Actualizar cliente existente
   * @param id - ID del cliente
   * @param updateClienteDto - Datos a actualizar
   * @param file - Nueva foto (opcional)
   * @returns Cliente actualizado
   */
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: clientesFotoStorage,
      fileFilter: fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = {
      ...updateClienteDto,
      ...(file && { foto: file.filename }),
    };
    return await this.clientesService.update(id, data);
  }

  /**
   * Eliminar cliente
   * @param id - ID del cliente
   * @returns Confirmación de eliminación
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.clientesService.remove(id);
    return { message: 'Cliente eliminado exitosamente', id };
  }
}

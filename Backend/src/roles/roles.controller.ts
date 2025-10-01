import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

// Obtener todos los roles
  @Get()
  getAllRoles() {
    return this.rolesService.findAll();
  }
}

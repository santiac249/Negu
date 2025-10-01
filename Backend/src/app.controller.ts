import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('roles')
  getRoles() {
    return { message: 'Roles obtenidos correctamente 🎉' };
  }
}
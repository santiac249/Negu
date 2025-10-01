import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private allowedRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Usuario no autenticado');

    if (this.allowedRoles.includes(user.rol)) return true;

    throw new ForbiddenException('No tienes permisos para acceder ' + JSON.stringify(user));
  }
}
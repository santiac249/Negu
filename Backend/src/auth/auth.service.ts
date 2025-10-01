import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  // Login por "usuario" + "contrasena"
  async validateUser(usuario: string, plainPass: string) {
    const user = await this.usuariosService.findByUsuario(usuario); // crea este método si no existe
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    if (!user.activo) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    const ok = await bcrypt.compare(plainPass, user.contrasena);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    // Limpia contraseña
    const { contrasena, ...rest } = user;
    return rest;
  }

  async login(usuario: string, contrasena: string) {
    if (!usuario || !contrasena) {
      throw new BadRequestException('Usuario y contraseña son obligatorios');
    }
    const safeUser = await this.validateUser(usuario, contrasena);

    // payload típico
    const payload = {
      sub: safeUser.id,
      usuario: safeUser.usuario,
      rol_id: safeUser.rol_id,
      rol: safeUser.rol.rol // si incluyes relación
    };

    const access_token = await this.jwtService.signAsync(payload);
    return {
      access_token,
      user: safeUser,
    };
  }

  async me(userFromReq: any) {
    // userFromReq viene del token decodificado por JwtStrategy
    // Puedes devolver info fresca desde BD si quieres:
    const user = await this.usuariosService.findById(userFromReq.sub);
    if (!user) throw new UnauthorizedException();
    const { contrasena, ...rest } = user;
    return rest;
  }
}

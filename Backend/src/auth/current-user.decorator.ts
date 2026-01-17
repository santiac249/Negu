import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extrae el usuario actual del request.
 * Requiere que JwtAuthGuard haya añadido `req.user` al objeto Request.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../jwt-payload.interface';

/** Liefert den vom JwtAuthGuard authentifizierten Nutzer. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const req = ctx.switchToHttp().getRequest<Request>();
    if (!req.user) throw new Error('CurrentUser ohne JwtAuthGuard verwendet.');
    return req.user;
  },
);

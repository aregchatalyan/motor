import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from 'prisma/client';
import { JwtPayload } from './auth.guard';
import { ROLES_KEY } from './role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [ context.getHandler(), context.getClass() ]
    );
    if (!roles) return true;

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    if (!user.roles?.some((role) => roles.includes(role))) {
      throw new ForbiddenException();
    }

    return true;
  }
}

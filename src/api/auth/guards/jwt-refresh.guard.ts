import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload, UserPayload } from './types';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();

    const { refreshToken } = req.cookies;
    if (!refreshToken) throw new UnauthorizedException();

    try {
      const payload = this.jwt.verify<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET')
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId, active: true, confirmed: true },
        include: { tokens: true },
        omit: { secret: true, password: true }
      });
      if (!user) throw new UnauthorizedException();

      req.user = user as UserPayload;

      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}

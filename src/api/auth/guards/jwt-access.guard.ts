import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload, UserPayload } from './types';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();

    const [ type, token ] = req.headers.authorization?.split(' ') || [];
    if (type !== 'Bearer' || !token) throw new UnauthorizedException();

    const { refreshToken } = req.cookies;
    if (!refreshToken) throw new UnauthorizedException();

    try {
      const payload = this.jwt.verify<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET')
      });

      const session = await this.prisma.token.findUnique({
        where: { refreshToken }
      });
      if (!session) throw new UnauthorizedException();

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

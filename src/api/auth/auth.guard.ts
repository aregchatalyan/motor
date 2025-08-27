import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenEnum, User } from 'prisma/client';
import { EnvConfig, envConfig } from '../../config/env';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: number;
  email: string;
  iat?: number;
  exp?: number;
}

export type UserPayload = Pick<User, 'id' | 'email'>;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(envConfig.KEY)
    private config: EnvConfig,
    private jwt: JwtService,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();

    const [ type, accessToken ] = req.headers.authorization?.split(' ') || [];
    if (type !== 'Bearer' || !accessToken) throw new UnauthorizedException();

    const { refreshToken } = req.cookies;
    if (!refreshToken) throw new UnauthorizedException();

    try {
      const access = this.jwt.verify<JwtPayload>(accessToken, { secret: this.config.JWT_ACCESS_SECRET });
      const refresh = this.jwt.verify<JwtPayload>(refreshToken, { secret: this.config.JWT_REFRESH_SECRET });
      if (access.sub !== refresh.sub) throw new UnauthorizedException();

      const data = await this.prisma.token.update({
        where: {
          token: refreshToken,
          type: TokenEnum.REFRESH,
          expiredAt: { gte: new Date() },
          user: { id: access.sub, active: true, verified: true }
        },
        data: { usedAt: new Date() },
        include: { user: true }
      });

      req.user = { id: data.user.id, email: data.user.email };

      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}

import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-access.strategy';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([ ({ cookies }: Request['cookies']) => cookies?.refreshToken ]),
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET')!,
      passReqToCallback: true
    });
  }

  async validate(request: Request, payload: JwtPayload) {
    const { refreshToken } = request?.cookies;
    if (!refreshToken) throw new UnauthorizedException();

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId, active: true, confirmed: true },
      include: { tokens: true },
      omit: { secret: true, password: true }
    });

    if (!user || !user.tokens.length) return true;
    return user;
  }
}

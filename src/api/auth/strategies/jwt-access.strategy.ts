import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { $Enums, Token } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

export interface JwtPayload {
  userId: number;
  email: string;
}

export type UserPayload = {
  id: number;
  name: string;
  surname: string;
  avatar: string | null;
  mobile: string;
  email: string;
  active: boolean;
  confirmed: boolean;
  roles: $Enums.Role[];
  createdAt: Date;
  updatedAt: Date;
  tokens: Token[];
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET')!
    });
  }

  async validate(payload: JwtPayload): Promise<UserPayload | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId, active: true, confirmed: true },
      include: { tokens: true },
      omit: { secret: true, password: true }
    });

    if (!user || !user.tokens.length) return null;
    return user;
  }
}

import ms, { StringValue } from 'ms';
import { randomUUID } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { compare, hash } from '../../utils/bcrypt';
import { SignUpDto } from './dto/sign-up/sign-up.dto';
import { SignInDto } from './dto/sign-in/sign-in.dto';
import { JwtPayload, UserPayload } from './auth.guard';
import { envConfig, EnvConfig } from '../../config/env';
import { MailerService } from '../../mailer/mailer.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenEnum } from 'prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(envConfig.KEY)
    private readonly config: EnvConfig,
    private readonly jwt: JwtService,
    private readonly mailer: MailerService,
    private readonly prisma: PrismaService
  ) {}

  async signup(dto: SignUpDto, ip?: string) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [ { username: dto.username }, { email: dto.email } ] }
    });
    if (exists) throw new BadRequestException();

    const token = randomUUID();
    const password = await hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password,
        tokens: {
          create: {
            ip,
            token,
            expiredAt: new Date(Date.now() + 86400)
          }
        }
      }
    });

    await this.mailer.sendSignUpEmail({
      to: user.email,
      context: { email: user.email, token }
    });

    return { success: true }
  }

  async signin(dto: SignInDto, ip?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [ { username: dto.username }, { email: dto.email } ],
        active: true, verified: true
      }
    });
    if (!user) throw new NotFoundException();

    const correct = await compare(dto.password, user.password);
    if (!correct) throw new BadRequestException();

    const { expiresIn, ...tokens } = this.generateTokens({
      sub: user.id, email: user.email
    });

    await this.prisma.token.create({
      data: {
        ip,
        token: tokens.refreshToken,
        type: TokenEnum.REFRESH,
        expiredAt: new Date(Date.now() + ms(expiresIn)),
        user: { connect: { id: user.id } }
      }
    });

    return { ...tokens, maxAge: ms(expiresIn) };
  }

  async signout(refreshToken: string) {
    try {
      await this.prisma.token.delete({
        where: { token: refreshToken, type: TokenEnum.REFRESH }
      });

      return { success: true }
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async verify(token: string) {
    try {
      await this.prisma.token.update({
        where: { token, user: { active: true } },
        data: { usedAt: new Date(), user: { update: { verified: true } } }
      });

      return { success: true }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async me(user: UserPayload) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
      omit: { password: true },
      include: { profile: true }
    });
  }

  async remove(user: UserPayload) {
    try {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: user.id },
          data: { active: false, deletedAt: new Date() }
        }),
        this.prisma.token.deleteMany({
          where: { userId: user.id }
        })
      ]);

      return { success: true }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async refresh(user: UserPayload, token: string, ip?: string) {
    const { expiresIn, ...tokens } = this.generateTokens({
      sub: user.id, email: user.email
    });

    try {
      await this.prisma.token.update({
        where: { token, type: TokenEnum.REFRESH },
        data: { ip, token: tokens.refreshToken }
      });

      return { ...tokens, maxAge: ms(expiresIn) }
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  private generateTokens(payload: JwtPayload) {
    const expiresIn = this.config.JWT_REFRESH_EXPIRES as StringValue;

    return {
      accessToken: this.jwt.sign({ sub: payload.sub, email: payload.email }),
      refreshToken: this.jwt.sign({ sub: payload.sub, email: payload.email }, {
        expiresIn,
        secret: this.config.JWT_REFRESH_SECRET
      }),
      expiresIn
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async clean() {
    this.logger.warn('Expired tokens removal has begun.');

    const { count } = await this.prisma.token.deleteMany({
      where: { expiredAt: { lt: new Date() } }
    });

    this.logger.warn(`${ count } expired token(s) have been removed.`);
  }
}

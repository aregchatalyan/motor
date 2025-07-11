import ms from 'ms';
import { randomUUID } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from '../../utils/bcrypt';
import { SignUpDto } from './dto/sign-up/sign-up.dto';
import { SignInDto } from './dto/sign-in/sign-in.dto';
import { JwtPayload, UserPayload } from './guards/types';
import { MailerService } from '../../mailer/mailer.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
    private readonly prisma: PrismaService
  ) {}

  async signup(dto: SignUpDto) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [ { email: dto.email }, { mobile: dto.mobile } ] }
    });
    if (exists) throw new BadRequestException();

    const secret = randomUUID();
    const password = await hash(dto.password);

    const user = await this.prisma.user.create({
      data: { ...dto, password, secret }
    });

    await this.mailer.sendMail({
      to: user.email,
      subject: 'Welcome to our service',
      template: 'confirm',
      context: { name: user.name, secret }
    });

    return { success: true }
  }

  async signin(dto: SignInDto, agent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, active: true, confirmed: true }
    });
    if (!user) throw new BadRequestException();

    const correct = await compare(dto.password, user.password);
    if (!correct) throw new BadRequestException();

    const {
      accessToken, refreshToken, expiresIn
    } = this.generateTokens({
      userId: user.id, email: user.email
    });

    await this.prisma.token.create({
      data: {
        agent,
        refreshToken,
        expiredAt: new Date(Date.now() + ms(expiresIn)),
        user: { connect: { id: user.id } }
      }
    });

    return { accessToken, refreshToken, maxAge: ms(expiresIn) };
  }

  async signout(refreshToken: string) {
    try {
      await this.prisma.token.delete({
        where: { refreshToken }
      });

      return { success: true }
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async confirm(secret: string) {
    try {
      await this.prisma.user.update({
        where: { secret },
        data: { active: true, confirmed: true, secret: null }
      });

      return { success: true }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async me(user: UserPayload) {
    return user;
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

  async refresh(user: UserPayload, token: string, agent?: string) {
    const {
      accessToken, refreshToken, expiresIn
    } = this.generateTokens({
      userId: user.id, email: user.email
    });

    try {
      await this.prisma.token.update({
        where: { refreshToken: token },
        data: { agent, refreshToken }
      });

      return { accessToken, refreshToken, maxAge: ms(expiresIn) }
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  private generateTokens(payload: JwtPayload) {
    const expiresIn = this.config.getOrThrow<ms.StringValue>('JWT_REFRESH_EXPIRES');

    const accessToken = this.jwt.sign({ userId: payload.userId, email: payload.email })
    const refreshToken = this.jwt.sign({ userId: payload.userId, email: payload.email }, {
      expiresIn,
      secret: this.config.get<string>('JWT_REFRESH_SECRET')
    });

    return { accessToken, refreshToken, expiresIn }
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

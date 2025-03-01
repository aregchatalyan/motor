import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserUpdateDto } from './dto/update/user-update.dto';
import { UserPayload } from '../auth/strategies/jwt-access.strategy';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async avatar(avatar: Express.Multer.File, user: UserPayload) {
    try {
      return this.prisma.user.update({
        where: { id: user.id },
        data: { avatar: avatar.path },
        include: { tokens: true },
        omit: { password: true, secret: true }
      });
    } catch (e) {
      throw new BadRequestException();
    }
  }

  update(dto: UserUpdateDto, user: UserPayload) {
    try {
      return this.prisma.user.update({
        where: { id: user.id },
        data: dto,
        include: { tokens: true },
        omit: { password: true, secret: true }
      });
    } catch (e) {
      throw new BadRequestException();
    }
  }
}

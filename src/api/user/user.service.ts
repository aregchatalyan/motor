import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update/update-user.dto';
import { UserPayload } from '../auth/strategies/jwt-access.strategy';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async avatar(avatar: Express.Multer.File, user: UserPayload) {
    return this.prisma.user.update({
      where: { id: user.id },
      data: { avatar: avatar.path },
      include: { tokens: true },
      omit: { password: true, secret: true }
    });
  }

  update(dto: UpdateUserDto, user: UserPayload) {
    try { // TODO implement
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

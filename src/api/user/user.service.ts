import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from '../../utils/bcrypt';
import { UserPayload } from '../auth/guards/types';
import { PrismaService } from '../../prisma/prisma.service';
import { UserUpdateDto } from './dto/update/user-update.dto';

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

  async update(dto: UserUpdateDto, user: UserPayload) {
    try {
      if (dto.password) {
        dto.password = await hash(dto.password);
      }

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

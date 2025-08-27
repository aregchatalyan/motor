import { BadRequestException, Injectable } from '@nestjs/common';
import { UserPayload } from '../auth/auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileUpdateDto } from './dto/update/profile-update.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async avatar(avatar: Express.Multer.File, user: UserPayload) {
    try {
      return this.prisma.profile.update({
        where: { userId: user.id },
        data: { avatar: avatar.path }
      });
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async update(dto: ProfileUpdateDto, user: UserPayload) {
    try {
      return this.prisma.profile.update({
        where: { userId: user.id },
        data: dto
      });
    } catch (e) {
      throw new BadRequestException();
    }
  }
}

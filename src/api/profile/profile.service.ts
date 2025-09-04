import { BadRequestException, Injectable } from '@nestjs/common';
import { UserPayload } from '../auth/auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileCreateDto } from './dto/update/profile-create.dto';
import { ProfileUpdateDto } from './dto/update/profile-update.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: ProfileCreateDto, user: UserPayload) {
    const exists = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true }
    });
    if (exists?.profile) throw new BadRequestException();

    if (dto.birthday) dto.birthday = new Date(dto.birthday);

    try {
      return this.prisma.profile.create({
        data: {
          ...dto,
          user: { connect: { id: user.id } }
        }
      });
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async update(dto: ProfileUpdateDto, user: UserPayload) {
    if (dto.birthday) dto.birthday = new Date(dto.birthday);

    try {
      return this.prisma.profile.update({
        where: { userId: user.id },
        data: { ...dto }
      });
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async avatar(avatar: Express.Multer.File, user: UserPayload) {
    const exists = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true }
    });
    if (!exists?.profile) throw new BadRequestException();

    try {
      return this.prisma.profile.update({
        where: { userId: user.id },
        data: { avatar: avatar.path }
      });
    } catch (e) {
      throw new BadRequestException();
    }
  }
}

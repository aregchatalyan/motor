import { FileInterceptor } from '@nestjs/platform-express';
import { Body, Controller, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { multer } from '../../utils/multer';
import { ProfileService } from './profile.service';
import { CurrentUser } from '../auth/auth.decorator';
import { AuthGuard, UserPayload } from '../auth/auth.guard';
import { ProfileCreateDto } from './dto/profile-create.dto';
import { ProfileUpdateDto } from './dto/profile-update.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  create(@Body() dto: ProfileCreateDto, @CurrentUser() user: UserPayload) {
    return this.profile.create(dto, user);
  }

  @UseGuards(AuthGuard)
  @Put('update')
  update(@Body() dto: ProfileUpdateDto, @CurrentUser() user: UserPayload) {
    return this.profile.update(dto, user);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar', multer))
  @Post('avatar')
  avatar(@UploadedFile() avatar: Express.Multer.File, @CurrentUser() user: UserPayload) {
    return this.profile.avatar(avatar, user);
  }
}

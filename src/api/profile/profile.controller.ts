import { Body, Controller, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { multer } from '../../utils/multer';
import { ProfileService } from './profile.service';
import { CurrentUser } from '../auth/auth.decorator';
import { AuthGuard, UserPayload } from '../auth/auth.guard';
import { ProfileDataDto } from './dto/update/profile-data.dto';
import { ProfileUpdateDto } from './dto/update/profile-update.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar', multer))
  @Post('avatar')
  avatar(@UploadedFile() avatar: Express.Multer.File, @CurrentUser() user: UserPayload) {
    return this.profile.avatar(avatar, user);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: ProfileDataDto })
  @UseGuards(AuthGuard)
  @Put('update')
  update(@Body() dto: ProfileUpdateDto, @CurrentUser() user: UserPayload) {
    return this.profile.update(dto, user);
  }
}

import { Body, Controller, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { multer } from '../../utils/multer';
import { UserService } from './user.service';
import { UserPayload } from '../auth/guards/types';
import { CurrentUser } from '../auth/auth.decorator';
import { UserDataDto } from './dto/update/user-data.dto';
import { UserUpdateDto } from './dto/update/user-update.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAccessGuard)
  @UseInterceptors(FileInterceptor('avatar', multer))
  @Post('/avatar')
  avatar(@UploadedFile() avatar: Express.Multer.File, @CurrentUser() user: UserPayload) {
    return this.user.avatar(avatar, user);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: UserDataDto })
  @UseGuards(JwtAccessGuard)
  @Patch('/update')
  update(@Body() dto: UserUpdateDto, @CurrentUser() user: UserPayload) {
    return this.user.update(dto, user);
  }
}

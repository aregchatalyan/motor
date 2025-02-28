import { Body, Controller, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { multer } from '../../utils/multer';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/auth.decorator';
import { UpdateUserDto } from './dto/update/update-user.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { UserPayload } from '../auth/strategies/jwt-access.strategy';

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
  @UseGuards(JwtAccessGuard)
  @Patch()
  update(@Body() dto: UpdateUserDto, @CurrentUser() user: UserPayload) {
    return this.user.update(dto, user);
  }
}

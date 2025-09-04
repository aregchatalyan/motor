import { Body, Controller, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { multer } from '../../utils/multer';
import { ProfileService } from './profile.service';
import { CurrentUser } from '../auth/auth.decorator';
import { AuthGuard, UserPayload } from '../auth/auth.guard';
import { SuccessDto } from '../auth/dto/success.dto';
import { ProfileDataDto } from './dto/update/profile-data.dto';
import { ProfileCreateDto } from './dto/update/profile-create.dto';
import { ProfileUpdateDto } from './dto/update/profile-update.dto';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @ApiOperation({ summary: 'Create the user profile' })
  @ApiBearerAuth()
  @ApiBody({ type: ProfileCreateDto })
  @ApiOkResponse({ description: 'Profile created successfully.', type: ProfileDataDto })
  @ApiBadRequestResponse({ description: 'Invalid profile data.' })
  @UseGuards(AuthGuard)
  @Post('create')
  create(@Body() dto: ProfileCreateDto, @CurrentUser() user: UserPayload) {
    return this.profile.create(dto, user);
  }

  @ApiOperation({ summary: 'Update the user profile data' })
  @ApiBearerAuth()
  @ApiBody({ type: ProfileUpdateDto })
  @ApiOkResponse({ description: 'Profile updated successfully.', type: ProfileDataDto })
  @ApiBadRequestResponse({ description: 'Invalid profile data or failed to update.' })
  @UseGuards(AuthGuard)
  @Put('update')
  update(@Body() dto: ProfileUpdateDto, @CurrentUser() user: UserPayload) {
    return this.profile.update(dto, user);
  }

  @ApiOperation({ summary: 'Upload a new avatar for the user profile' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary'
        }
      }
    },
    description: 'The file to upload.'
  })
  @ApiOkResponse({ description: 'Avatar uploaded successfully.', type: SuccessDto })
  @ApiBadRequestResponse({ description: 'Invalid file or file upload failed.' })
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar', multer))
  @Post('avatar')
  avatar(@UploadedFile() avatar: Express.Multer.File, @CurrentUser() user: UserPayload) {
    return this.profile.avatar(avatar, user);
  }
}

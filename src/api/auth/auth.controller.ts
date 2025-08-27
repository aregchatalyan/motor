import { Request, Response } from 'express';
import { ApiBearerAuth, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './auth.decorator';
import { AccessDto } from './dto/access.dto';
import { SuccessDto } from './dto/success.dto';
import { MeDataDto } from './dto/me/me-data.dto';
import { SignUpDto } from './dto/sign-up/sign-up.dto';
import { SignInDto } from './dto/sign-in/sign-in.dto';
import { AuthGuard, UserPayload } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiCreatedResponse({ type: SuccessDto })
  @Post('signup')
  signup(
    @Ip() ip: string,
    @Body() dto: SignUpDto
  ) {
    return this.auth.signup(dto, ip);
  }

  @ApiOkResponse({ type: AccessDto })
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SignInDto
  ) {
    const { accessToken, refreshToken, maxAge } = await this.auth.signin(dto, ip);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge });

    return { accessToken };
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessDto })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('signout')
  async signout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const token = req.cookies['refreshToken'] as string;

    const { success } = await this.auth.signout(token);

    res.clearCookie('refreshToken');

    return { success };
  }

  @ApiOkResponse({ type: SuccessDto })
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  confirm(@Body('token', ParseUUIDPipe) token: string) {
    return this.auth.confirm(token);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: MeDataDto })
  @Get('me')
  me(@CurrentUser() user: UserPayload) {
    return this.auth.me(user);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessDto })
  @UseGuards(AuthGuard)
  @Delete('remove')
  remove(@CurrentUser() user: UserPayload) {
    return this.auth.remove(user);
  }

  @ApiCookieAuth()
  @ApiOkResponse({ type: AccessDto })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Ip() ip: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: UserPayload
  ) {
    const { refreshToken: token } = req.cookies;

    const { accessToken, refreshToken, maxAge } = await this.auth.refresh(user, token, ip);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge });

    return { accessToken };
  }
}

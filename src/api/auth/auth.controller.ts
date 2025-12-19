import { Request, Response } from 'express';
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
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { CurrentUser } from './auth.decorator';
import { AuthGuard, UserPayload } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('sign-up')
  signup(
    @Ip() ip: string,
    @Body() dto: SignUpDto
  ) {
    return this.auth.signup(dto, ip);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SignInDto
  ) {
    const { accessToken, refreshToken, maxAge } = await this.auth.signIn(dto, ip);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge });

    return { accessToken };
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('sign-out')
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const token = req.cookies['refreshToken'] as string;

    const { success } = await this.auth.signOut(token);

    res.clearCookie('refreshToken');

    return { success };
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify')
  verify(@Body('token', ParseUUIDPipe) token: string) {
    return this.auth.verify(token);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@CurrentUser() user: UserPayload) {
    return this.auth.me(user);
  }

  @UseGuards(AuthGuard)
  @Delete('remove')
  remove(@CurrentUser() user: UserPayload) {
    return this.auth.remove(user);
  }

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

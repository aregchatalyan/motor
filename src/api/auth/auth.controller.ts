import { Request, Response } from 'express';
import { ApiBearerAuth, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './auth.decorator';
import { MeDataDto } from './dto/me/me-data.dto';
import { SignUpDto } from './dto/sign-up/sign-up.dto';
import { SignInDto } from './dto/sign-in/sign-in.dto';
import { SignUpDataDto } from './dto/sign-up/sign-up-data.dto';
import { SignInDataDto } from './dto/sign-in/sign-in-data.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { UserPayload } from './strategies/jwt-access.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiCreatedResponse({ type: SignUpDataDto })
  @Post('/signup')
  signup(@Body() dto: SignUpDto) {
    return this.auth.signup(dto);
  }

  @ApiOkResponse({ type: SignInDataDto })
  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  async signin(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SignInDto
  ) {
    const agent = req.headers['user-agent'];
    const { accessToken, refreshToken, maxAge } = await this.auth.signin(dto, agent);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge });

    return { accessToken };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/signout')
  async signout(@Req() req: Request, @Res() res: Response) {
    const { refreshToken } = req.cookies;
    await this.auth.signout(refreshToken);

    res.clearCookie('refreshToken');
    res.end();
  }

  @Get('/confirm/:secret')
  confirm(@Param('secret') secret: string) {
    return this.auth.confirm(secret);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @ApiOkResponse({ type: MeDataDto })
  @Get('/me')
  me(@CurrentUser() user: UserPayload) {
    return this.auth.me(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Delete('/remove')
  remove(@CurrentUser() user: UserPayload) {
    return this.auth.remove(user);
  }

  @ApiCookieAuth()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: UserPayload
  ) {
    const agent = req.headers['user-agent'];
    const token = req.cookies['refreshToken'] as string;

    const { accessToken, refreshToken, maxAge } = await this.auth.refresh(user, token, agent);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge });

    return { accessToken };
  }
}

import { Request, Response } from 'express';
import { ApiBearerAuth, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './auth.decorator';
import { AccessDto } from './dto/access.dto';
import { SuccessDto } from './dto/success.dto';
import { MeDataDto } from './dto/me/me-data.dto';
import { SignUpDto } from './dto/sign-up/sign-up.dto';
import { SignInDto } from './dto/sign-in/sign-in.dto';
import { ConfirmDto } from './dto/confirm/confirm.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { UserPayload } from './strategies/jwt-access.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiCreatedResponse({ type: SuccessDto })
  @Post('/signup')
  signup(@Body() dto: SignUpDto) {
    return this.auth.signup(dto);
  }

  @ApiOkResponse({ type: AccessDto })
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
  @ApiOkResponse({ type: SuccessDto })
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/signout')
  async signout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['refreshToken'] as string;

    const { success } = await this.auth.signout(token);

    res.clearCookie('refreshToken');

    return { success };
  }

  @ApiOkResponse({ type: SuccessDto })
  @HttpCode(HttpStatus.OK)
  @Post('/confirm')
  confirm(@Body() body: ConfirmDto) {
    return this.auth.confirm(body.secret);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @ApiOkResponse({ type: MeDataDto })
  @Get('/me')
  me(@CurrentUser() user: UserPayload) {
    return this.auth.me(user);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessDto })
  @UseGuards(JwtAccessGuard)
  @Delete('/remove')
  remove(@CurrentUser() user: UserPayload) {
    return this.auth.remove(user);
  }

  @ApiCookieAuth()
  @ApiOkResponse({ type: AccessDto })
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

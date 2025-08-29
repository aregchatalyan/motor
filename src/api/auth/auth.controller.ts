import { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiOperation({ summary: 'Create a new user account' })
  @ApiCreatedResponse({ description: 'User account created successfully', type: SuccessDto })
  @ApiBadRequestResponse({ description: 'User already exists' })
  @Post('signup')
  signup(
    @Ip() ip: string,
    @Body() dto: SignUpDto
  ) {
    return this.auth.signup(dto, ip);
  }

  @ApiOperation({ summary: 'Authenticate and sign in a user' })
  @ApiOkResponse({ description: 'Successfully signed in, returns access token', type: AccessDto })
  @ApiBadRequestResponse({ description: 'Incorrect password or invalid request' })
  @ApiNotFoundResponse({ description: 'User not found' })
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

  @ApiOperation({ summary: 'Sign out the current user' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User successfully signed out', type: SuccessDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing refresh token' })
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

  @ApiOperation({ summary: 'Confirm user account with a verification token' })
  @ApiOkResponse({ description: 'Account verified successfully', type: SuccessDto })
  @ApiBadRequestResponse({ description: 'Invalid token or user is not active' })
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  confirm(@Body('token', ParseUUIDPipe) token: string) {
    return this.auth.confirm(token);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Returns user profile data', type: MeDataDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  @Get('me')
  me(@CurrentUser() user: UserPayload) {
    return this.auth.me(user);
  }

  @ApiOperation({ summary: 'Deactivate and soft-delete the current user account' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Account successfully removed', type: SuccessDto })
  @ApiBadRequestResponse({ description: 'User could not be removed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  @UseGuards(AuthGuard)
  @Delete('remove')
  remove(@CurrentUser() user: UserPayload) {
    return this.auth.remove(user);
  }

  @ApiOperation({ summary: 'Refresh access token using a refresh token' })
  @ApiCookieAuth()
  @ApiOkResponse({ description: 'Access token refreshed successfully', type: AccessDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
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

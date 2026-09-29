import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthResponseMapper } from './auth-response.mapper.js';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { AuthSessionData, AuthUser } from '@test/shared';

import { AuthCookieService } from '@/config/auth-cookie.service.js';

import { AuthService } from './auth.service.js';
import {
  PasswordLoginDto,
  PasswordRegisterDto,
} from './dto/password-auth.dto.js';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from './jwt/jwt-auth.guard.js';

type PublicUserSource = {
  id: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  status: AuthUser['status'];
  createdAt: Date;
  updatedAt: Date;
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookies: AuthCookieService,
    private readonly authResponseMapper: AuthResponseMapper,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({
    summary: 'Register with email and password / 註冊帳密帳號',
    description: '建立帳密帳號，並設定 access 與 refresh HttpOnly JWT Cookie。',
  })
  @ApiBody({ type: PasswordRegisterDto })
  @ApiResponse({ status: 201, description: '帳號建立並登入成功。' })
  @ApiResponse({ status: 400, description: '請求資料格式錯誤。' })
  @ApiResponse({ status: 409, description: 'Email 已存在。' })
  async register(
    @Body() dto: PasswordRegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionData> {
    const result = await this.authService.register(
      dto.email,
      dto.password,
      dto.name,
    );

    this.authCookies.setLoginCookies(response, {
      accessToken: result.accessToken.token,
      refreshToken: result.refreshToken.token,
    });

    return this.authResponseMapper.toSessionData(result.user, result.roles, result.accessToken.expiresAt);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({
    summary: 'Login with email and password / 帳密登入',
    description: '驗證帳密，並設定 access 與 refresh HttpOnly JWT Cookie。',
  })
  @ApiBody({ type: PasswordLoginDto })
  @ApiResponse({ status: 200, description: '登入成功。' })
  @ApiResponse({ status: 401, description: '帳密錯誤或帳號不可登入。' })
  async loginWithPassword(
    @Body() dto: PasswordLoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionData> {
    const result = await this.authService.loginWithPassword(
      dto.email,
      dto.password,
    );

    this.authCookies.setLoginCookies(response, {
      accessToken: result.accessToken.token,
      refreshToken: result.refreshToken.token,
    });

    return this.authResponseMapper.toSessionData(result.user, result.roles,  result.accessToken.expiresAt);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Get current user / 取得目前使用者',
    description: '驗證 access JWT，並查詢目前使用者。',
  })
  @ApiResponse({ status: 200, description: '目前使用者。' })
  @ApiResponse({ status: 401, description: '未登入或帳號不可登入。' })
  async me(
    @Req() request: AuthenticatedRequest,
  ): Promise<AuthSessionData> {
    const { user, roles } =
      await this.authService.getCurrentUserWithRoles(request.user.id);

    return this.authResponseMapper.toSessionData(
      user,
      roles,
      request.user.accessTokenExpiresAt,
    );
  }
 

}
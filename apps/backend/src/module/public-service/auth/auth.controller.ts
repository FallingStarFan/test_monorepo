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
import { ApiBody, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthResponseMapper } from './auth-response.mapper.js';

import type { AuthSessionData } from '@test/shared';
import {
  ApiEnvelopeResponse,
  ApiErrorEnvelopeResponse,
} from '@/common/response/swagger-response.decorator.js';
import { MESSAGES } from '@/common/response/messages.js';

import { AuthCookieService } from '@/config/auth-cookie.service.js';

import { AuthService } from './auth.service.js';
import {
  PasswordLoginDto,
  PasswordRegisterDto,
} from './dto/password-auth.dto.js';
import { AuthSessionDataDto } from './dto/auth-response.dto.js';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from './guard/jwt-auth.guard.js';

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
  @ApiEnvelopeResponse({
    status: HttpStatus.CREATED,
    message: MESSAGES.AUTH_REGISTERED,
    data: AuthSessionDataDto,
  })
  @ApiErrorEnvelopeResponse(400, MESSAGES.BAD_REQUEST)
  @ApiErrorEnvelopeResponse(409, MESSAGES.EMAIL_ALREADY_EXISTS)
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

    return this.authResponseMapper.toSessionData(
      result.user,
      result.roles,
      result.accessToken.expiresAt,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email and password / 帳密登入',
    description: '驗證帳密，並設定 access 與 refresh HttpOnly JWT Cookie。',
  })
  @ApiBody({ type: PasswordLoginDto })
  @ApiEnvelopeResponse({
    status: HttpStatus.OK,
    message: MESSAGES.AUTH_LOGIN_SUCCESS,
    data: AuthSessionDataDto,
  })
  @ApiErrorEnvelopeResponse(400, MESSAGES.BAD_REQUEST)
  @ApiErrorEnvelopeResponse(401, MESSAGES.INVALID_CREDENTIALS)
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

    return this.authResponseMapper.toSessionData(
      result.user,
      result.roles,
      result.accessToken.expiresAt,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Get current user / 取得目前使用者',
    description: '驗證 access JWT，並查詢目前使用者。',
  })
  @ApiEnvelopeResponse({
    status: HttpStatus.OK,
    message: MESSAGES.CURRENT_USER_RETRIEVED,
    data: AuthSessionDataDto,
  })
  @ApiErrorEnvelopeResponse(401, MESSAGES.TOKEN_INVALID)
  async me(@Req() request: AuthenticatedRequest): Promise<AuthSessionData> {
    const { user, roles } = await this.authService.getCurrentUserWithRoles(
      request.user.id,
    );

    return this.authResponseMapper.toSessionData(
      user,
      roles,
      request.user.accessTokenExpiresAt,
    );
  }
}

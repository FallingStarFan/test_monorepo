import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { AuthCookieService } from '@/config/auth-cookie.service.js';
import env from '@/config/env.js';

import { AuthService } from './auth.service.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthTokenController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookies: AuthCookieService,
  ) {}

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Refresh JWT / 更新 Token',
    description:
      '驗證 refresh HttpOnly Cookie，重新簽發 access 與 refresh JWT。',
  })
  @ApiResponse({ status: 200, description: 'Token 更新成功。' })
  @ApiResponse({
    status: 401,
    description: 'Refresh Token 缺失、無效或過期。',
  })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.readCookie(
      request,
      env.refreshCookieName,
    );

    if (!refreshToken) {
      throw new UnauthorizedException({
        message: {
          en: 'Refresh token is missing',
          zh: '缺少 Refresh Token',
        },
      });
    }

    const result = await this.authService.refresh(refreshToken);

    this.authCookies.setLoginCookies(response, {
      accessToken: result.accessToken.token,
      refreshToken: result.refreshToken.token,
    });

    return {
      accessToken: {
        expiresAt: result.accessToken.expiresAt,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Logout / 登出',
    description:
      '清除目前瀏覽器的 access 與 refresh Cookie。已簽發的 JWT 仍會在到期時失效。',
  })
  @ApiResponse({ status: 200, description: '登入 Cookie 已清除。' })
  logout(@Res({ passthrough: true }) response: Response) {
    this.authCookies.clearLoginCookies(response);
    return { success: true };
  }

  private readCookie(
    request: Request,
    name: string,
  ): string | undefined {
    const value = request.cookies?.[name] as unknown;

    return typeof value === 'string' && value
      ? value
      : undefined;
  }
}
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';

import type { AuthSessionData, AuthUser } from '@test/shared';

import { AuthCookieService } from '@/config/auth-cookie.service.js';
import env from '@/config/env.js';

import type { OAuthProfile } from './auth.service.js';
import { AuthService } from './auth.service.js';
import {
  PasswordLoginDto,
  PasswordRegisterDto,
} from './dto/password-auth.dto.js';

import { JwtAuthGuard, type AuthenticatedRequest } from './jwt/jwt-auth.guard.js';
import {
  GithubOAuthGuard,
  GoogleOAuthGuard,
} from './strategies/oauth-state.guard.js';

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
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({
    summary: 'Register with email and password / 註冊帳密帳號',
    description:
      '建立帳密帳號，成功後設定 access 與 refresh HttpOnly JWT Cookie。',
  })
  @ApiBody({ type: PasswordRegisterDto })
  @ApiResponse({ status: 201, description: '帳號建立並登入成功。' })
  @ApiResponse({ status: 400, description: '請求資料格式錯誤。' })
  @ApiResponse({ status: 409, description: 'Email 已存在。' })
  async register(
    @Body() dto: PasswordRegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(
      dto.email,
      dto.password,
      dto.name,
    );

    this.setLoginCookies(response, result);
    return this.publicLoginData(result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({
    summary: 'Login with email and password / 帳密登入',
    description: '驗證帳密並設定 access 與 refresh HttpOnly JWT Cookie。',
  })
  @ApiBody({ type: PasswordLoginDto })
  @ApiResponse({ status: 200, description: '登入成功。' })
  @ApiResponse({ status: 401, description: '帳密錯誤或帳號不可登入。' })
  async loginWithPassword(
    @Body() dto: PasswordLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.loginWithPassword(
      dto.email,
      dto.password,
    );

    this.setLoginCookies(response, result);
    return this.publicLoginData(result);
  }

  @Get('google')
  @ApiOperation({
    summary: 'Start Google OAuth / 啟動 Google OAuth',
    description: '以瀏覽器導頁啟動 OAuth；returnTo 僅接受站內相對路徑。',
  })
  @ApiResponse({ status: 302, description: '導向 Google OAuth。' })
  googleLogin(
    @Query('returnTo') returnTo: string | undefined,
    @Res() response: Response,
  ) {
    return this.beginOAuth('google', returnTo, response);
  }

  @Get('google/start')
  @UseGuards(GoogleOAuthGuard)
  googleStart() {
    // Passport redirects to Google.
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiResponse({ status: 302, description: '設定 JWT Cookie 並導回前端。' })
  @ApiResponse({ status: 401, description: 'OAuth 或 state 驗證失敗。' })
  async googleCallback(@Req() request: Request, @Res() response: Response) {
    return this.completeOAuth(request, response);
  }

  @Get('github')
  @ApiOperation({
    summary: 'Start GitHub OAuth / 啟動 GitHub OAuth',
    description: '以瀏覽器導頁啟動 OAuth；returnTo 僅接受站內相對路徑。',
  })
  @ApiResponse({ status: 302, description: '導向 GitHub OAuth。' })
  githubLogin(
    @Query('returnTo') returnTo: string | undefined,
    @Res() response: Response,
  ) {
    return this.beginOAuth('github', returnTo, response);
  }

  @Get('github/start')
  @UseGuards(GithubOAuthGuard)
  githubStart() {
    // Passport redirects to GitHub.
  }

  @Get('github/callback')
  @UseGuards(GithubOAuthGuard)
  @ApiResponse({ status: 302, description: '設定 JWT Cookie 並導回前端。' })
  @ApiResponse({ status: 401, description: 'OAuth 或 state 驗證失敗。' })
  async githubCallback(@Req() request: Request, @Res() response: Response) {
    return this.completeOAuth(request, response);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Refresh JWT / 更新 Token',
    description:
      '驗證 refresh HttpOnly Cookie 中 JWT 的簽章與效期，通過後簽發新的 access JWT 與 refresh JWT。',
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
    const refreshToken = this.readCookie(request, env.refreshCookieName);

    if (!refreshToken) {
      throw new UnauthorizedException({
        message: {
          en: 'Refresh token is missing',
          zh: '缺少 Refresh Token',
        },
      });
    }

    const result = await this.authService.refresh(refreshToken);
    this.setLoginCookies(response, result);

    return {
      accessToken: {
        expiresAt: result.accessToken.expiresAt,
      },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Get current user / 取得目前使用者',
    description:
      '驗證 access JWT 的簽章與效期，並以 JWT 內的使用者 ID 查詢資料庫，回傳 ACTIVE 使用者。',
  })
  @ApiResponse({ status: 200, description: '目前使用者。' })
  @ApiResponse({
    status: 401,
    description: 'Access JWT 缺失、無效或過期，或使用者不可登入。',
  })
  async me(@Req() request: AuthenticatedRequest) {
    const user = await this.authService.getCurrentUser(request.user.id);

    return this.toAuthSessionData(user, request.user.accessTokenExpiresAt);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Logout / 登出',
    description:
      '清除目前瀏覽器的 access 與 refresh Cookie。JWT 為無狀態，已簽發的 Token 會在各自到期時失效。',
  })
  @ApiResponse({ status: 200, description: '登入 Cookie 已清除。' })
  logout(@Res({ passthrough: true }) response: Response) {
    this.authCookies.clearLoginCookies(response);

    return { success: true };
  }

  private beginOAuth(
    provider: 'google' | 'github',
    returnTo: string | undefined,
    response: Response,
  ) {
    const state = randomBytes(32).toString('base64url');

    this.authCookies.setOAuthCookie(response, env.oauthStateCookieName, state);
    this.authCookies.setOAuthCookie(
      response,
      env.oauthReturnToCookieName,
      this.getSafeReturnTo(returnTo),
    );

    return response.redirect(
      `/api/auth/${provider}/start?state=${encodeURIComponent(state)}`,
    );
  }

  private async completeOAuth(request: Request, response: Response) {
    const profile = request.user as OAuthProfile;
    const returnTo =
      this.readCookie(request, env.oauthReturnToCookieName) ?? '/';

    this.authCookies.clearOAuthCookie(response, env.oauthStateCookieName);
    this.authCookies.clearOAuthCookie(response, env.oauthReturnToCookieName);

    const result = await this.authService.loginWithOAuth(profile);
    this.setLoginCookies(response, result);

    return response.redirect(
      new URL(this.getSafeReturnTo(returnTo), env.frontendUrl).toString(),
    );
  }

  private setLoginCookies(
    response: Response,
    result: {
      accessToken: { token: string };
      refreshToken: { token: string };
    },
  ): void {
    this.authCookies.setLoginCookies(response, {
      accessToken: result.accessToken.token,
      refreshToken: result.refreshToken.token,
    });
  }

  private publicLoginData(result: {
    user: PublicUserSource;
    accessToken: { expiresAt: Date };
  }): AuthSessionData {
    return this.toAuthSessionData(result.user, result.accessToken.expiresAt);
  }

  private toAuthSessionData(
    user: PublicUserSource,
    expiresAt: Date,
  ): AuthSessionData {
    const publicUser: AuthUser = {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: user.image,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return {
      user: publicUser,
      accessToken: {
        expiresAt: expiresAt.toISOString(),
      },
    };
  }

  /**
   * 只允許站內相對路徑，防止 open redirect。
   * new URL() 解析時會自動移除 tab / 換行，
   * 所以 "/\t/evil.com" 會被還原成 "//evil.com"，
   * 因此除了檢查特殊字元，還要在解析後確認 origin 沒有變。
   */
  private getSafeReturnTo(returnTo?: string): string {
    if (
      !returnTo ||
      !returnTo.startsWith('/') ||
      /[\\\r\n\t]/.test(returnTo)
    ) {
      return '/';
    }

    try {
      const base = new URL(env.frontendUrl);
      const url = new URL(returnTo, base);

      if (url.origin !== base.origin) return '/';

      return url.pathname + url.search + url.hash;
    } catch {
      return '/';
    }
  }

  private readCookie(request: Request, name: string): string | undefined {
    const value = request.cookies?.[name] as unknown;
    return typeof value === 'string' && value ? value : undefined;
  }
}
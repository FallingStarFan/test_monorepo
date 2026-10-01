// oauth.controller.ts
import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';

import { AuthCookieService } from '@/config/auth-cookie.service.js';
import env from '@/config/env.js';

import { AuthService, type OAuthProfile } from './auth.service.js';
import { OAuthStartQueryDto } from './dto/oauth-start-query.dto.js';
import {
  GithubOAuthGuard,
  GoogleOAuthGuard,
} from './strategies/oauth-state.guard.js';

@ApiTags('Auth')
@Controller('auth')
export class OAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookies: AuthCookieService,
  ) {}

  @Get('google')
  @ApiOperation({
    summary: 'Start Google OAuth / 啟動 Google OAuth',
    description: '以瀏覽器導頁啟動 OAuth；returnTo 僅接受站內相對路徑。',
  })
  @ApiResponse({ status: 302, description: '導向 Google OAuth。' })
  googleLogin(@Query() query: OAuthStartQueryDto, @Res() response: Response) {
    return this.beginOAuth('google', query.returnTo, response);
  }

  @Get('google/start')
  @UseGuards(GoogleOAuthGuard)
  googleStart() {
    // Passport 會將瀏覽器導向 Google。
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
  githubLogin(@Query() query: OAuthStartQueryDto, @Res() response: Response) {
    return this.beginOAuth('github', query.returnTo, response);
  }

  @Get('github/start')
  @UseGuards(GithubOAuthGuard)
  githubStart() {
    // Passport 會將瀏覽器導向 GitHub。
  }

  @Get('github/callback')
  @UseGuards(GithubOAuthGuard)
  @ApiResponse({ status: 302, description: '設定 JWT Cookie 並導回前端。' })
  @ApiResponse({ status: 401, description: 'OAuth 或 state 驗證失敗。' })
  async githubCallback(@Req() request: Request, @Res() response: Response) {
    return this.completeOAuth(request, response);
  }

  /** 建立 OAuth state，保存導回路徑，再進入對應的 Passport guard。 */
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

  /** OAuth 驗證成功後登入使用者、設定 JWT Cookie，並導回前端。 */
  private async completeOAuth(request: Request, response: Response) {
    const profile = request.user as OAuthProfile;
    const returnTo =
      this.readCookie(request, env.oauthReturnToCookieName) ?? '/';

    this.authCookies.clearOAuthCookie(response, env.oauthStateCookieName);
    this.authCookies.clearOAuthCookie(response, env.oauthReturnToCookieName);

    const result = await this.authService.loginWithOAuth(profile);

    this.authCookies.setLoginCookies(response, {
      accessToken: result.accessToken.token,
      refreshToken: result.refreshToken.token,
    });

    return response.redirect(
      new URL(this.getSafeReturnTo(returnTo), env.frontendUrl).toString(),
    );
  }

  /** 僅接受前端站內相對路徑，避免 OAuth 完成後導向外部網站。 */
  private getSafeReturnTo(returnTo?: string): string {
    if (!returnTo || !returnTo.startsWith('/') || /[\\\r\n\t]/.test(returnTo)) {
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

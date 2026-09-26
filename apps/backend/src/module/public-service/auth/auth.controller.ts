import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import type { Request, Response } from 'express';

import env from '@/config/env.js';
import type { OAuthProfile } from './auth.service.js';
import { AuthService } from './auth.service.js';
import {
  PasswordLoginDto,
  PasswordRegisterDto,
} from './dto/password-auth.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({
    summary: 'Register with email and password / 註冊帳密帳號',
    description: '建立帳密帳號，成功後以 HttpOnly access_token cookie 登入。',
  })
  @ApiBody({ type: PasswordRegisterDto })
  @ApiResponse({ status: 201, description: '帳號建立並登入成功。' })
  @ApiResponse({ status: 400, description: '請求資料格式錯誤。' })
  @ApiResponse({ status: 409, description: 'Email 已存在。' })
  async register(
    @Body() dto: PasswordRegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(
      dto.email,
      dto.password,
      dto.name,
    );

    this.setSessionCookie(
      res,
      result.accessToken.token,
      result.accessToken.expiresAt,
    );

    return {
      user: result.user,
      accessToken: { expiresAt: result.accessToken.expiresAt },
    };
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({
    summary: 'Login with email and password / 帳密登入',
    description: '驗證 Email 與密碼，成功後以 HttpOnly access_token cookie 登入。',
  })
  @ApiBody({ type: PasswordLoginDto })
  @ApiResponse({ status: 201, description: '登入成功。' })
  @ApiResponse({ status: 400, description: '請求資料格式錯誤。' })
  @ApiResponse({ status: 401, description: 'Email、密碼錯誤或帳號不可登入。' })
  async loginWithPassword(
    @Body() dto: PasswordLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginWithPassword(
      dto.email,
      dto.password,
    );

    this.setSessionCookie(
      res,
      result.accessToken.token,
      result.accessToken.expiresAt,
    );

    return {
      user: result.user,
      accessToken: { expiresAt: result.accessToken.expiresAt },
    };
  }

  // ============================================================
  // Google OAuth
  // ============================================================

  /**
   * 開始 Google OAuth 登入
   *
   * 此 Endpoint 負責：
   *
   * 1. 接收 returnTo
   * 2. 將 returnTo 暫存在 HttpOnly Cookie
   * 3. Redirect 到真正啟動 Passport 的 Endpoint
   *
   * 前端仍然使用：
   *
   * GET /auth/google
   *
   * 或：
   *
   * GET /auth/google?returnTo=/docs
   */
  @Get('google')
  @ApiOperation({
    summary: '開始 Google OAuth 登入',
    description: `
啟動 Google OAuth 登入流程。

前端可以直接導向：

\`GET /auth/google\`

如果需要登入完成後回到指定頁面：

\`GET /auth/google?returnTo=/docs\`

returnTo 會暫存在 HttpOnly Cookie，
OAuth 完成後再由 Callback 讀取。

Swagger 的 \`Execute\` 不適合直接測試此 Endpoint，
因為此 API 最終會將瀏覽器導向 Google OAuth 頁面。
    `,
  })
  @ApiResponse({
    status: 302,
    description: '導向 Google OAuth 授權流程。',
  })
  googleLogin(
    @Query('returnTo') returnTo: string | undefined,
    @Res() res: Response,
  ) {
    const safeReturnTo =
      this.getSafeReturnTo(returnTo);

    res.cookie('oauth_return_to', safeReturnTo, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      path: '/auth',
    });

    return res.redirect('/api/auth/google/start');
  }

  /**
   * 真正啟動 Google Passport OAuth。
   *
   * 這裡才使用 AuthGuard('google')，
   * 確保 oauth_return_to Cookie 已經先被設定。
   */
  @Get('google/start')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth Callback',
    description: `
      本地測試 Google OAuth 登入流程：
      1. 瀏覽器導向：
        http://localhost:3013/api/auth/google?returnTo=%2Fdocs
     
      
      Oauth 只能用url 測試  因為要跳轉到google 登入頁面 不能用swagger 測試
      `,
  })
  googleStart() {
    // Passport 自動將瀏覽器導向 Google。
  }

  /**
   * Google OAuth Callback
   *
   * Google 完成授權後會回到：
   *
   * /auth/google/callback
   *
   * Google 的 callback URL 不需要因為 returnTo 而改變。
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth Callback',
    description: `
Google OAuth 完成授權後的 Callback Endpoint。

流程：

1. Google 完成使用者授權
2. Google Redirect 至此 Endpoint
3. Passport Google Strategy 驗證使用者
4. 取得 OAuth Profile
5. AuthService 建立或取得 User
6. 簽發 Access Token
7. Access Token 寫入 HttpOnly Cookie
8. 讀取 oauth_return_to
9. Redirect 回原本頁面
    `,
  })
  @ApiResponse({
    status: 302,
    description:
      'OAuth 登入成功，建立 Access Token Cookie 後重新導向前端。',
  })
  @ApiResponse({
    status: 401,
    description: 'Google OAuth 驗證失敗。',
  })
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const profile =
      req.user as OAuthProfile;

    const result =
      await this.authService.loginWithOAuth(
        profile,
      );

    this.setSessionCookie(
      res,
      result.accessToken.token,
      result.accessToken.expiresAt,
    );

    const returnTo =
      req.cookies?.oauth_return_to as
        | string
        | undefined;

    console.log(
      'Google OAuth returnTo:',
      returnTo,
    );

    res.clearCookie(
      'oauth_return_to',
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/auth',
      },
    );

    return res.redirect(
      `${env.webOrigin}${returnTo || '/'}`,
    );
  }

  // ============================================================
  // GitHub OAuth
  // ============================================================

  /**
   * 開始 GitHub OAuth 登入
   *
   * 前端仍然使用：
   *
   * GET /auth/github
   *
   * 或：
   *
   * GET /auth/github?returnTo=/docs
   */
  @Get('github')
  @ApiOperation({
    summary: '開始 GitHub OAuth 登入',
    description: `
啟動 GitHub OAuth 登入流程。

前端可以直接導向：

\`GET /auth/github\`

如果需要登入完成後回到指定頁面：

\`GET /auth/github?returnTo=/docs\`

Swagger 的 \`Execute\` 不適合直接測試此 Endpoint，
因為此 API 最終會將瀏覽器導向 GitHub OAuth 頁面。
    `,
  })
  @ApiResponse({
    status: 302,
    description: '導向 GitHub OAuth 授權流程。',
  })
  githubLogin(
    @Query('returnTo') returnTo: string | undefined,
    @Res() res: Response,
  ) {
    const safeReturnTo =
      this.getSafeReturnTo(returnTo);

    res.cookie('oauth_return_to', safeReturnTo, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      path: '/auth',
    });

    return res.redirect('/api/auth/github/start');
  }

  /**
   * 真正啟動 GitHub Passport OAuth。
   */
  @Get('github/start')
  @UseGuards(AuthGuard('github'))
  githubStart() {
    // Passport 自動將瀏覽器導向 GitHub。
  }

  /**
   * GitHub OAuth Callback
   */
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({
    summary: 'GitHub OAuth Callback',
    description: `
GitHub OAuth 完成授權後的 Callback Endpoint。

流程：

1. GitHub 完成使用者授權
2. GitHub Redirect 至此 Endpoint
3. Passport GitHub Strategy 驗證使用者
4. 取得 OAuth Profile
5. AuthService 建立或取得 User
6. 簽發 Access Token
7. Access Token 寫入 HttpOnly Cookie
8. 讀取 oauth_return_to
9. Redirect 回原本頁面
    `,
  })
  @ApiResponse({
    status: 302,
    description:
      'OAuth 登入成功，建立 Access Token Cookie 後重新導向前端。',
  })
  @ApiResponse({
    status: 401,
    description: 'GitHub OAuth 驗證失敗。',
  })
  async githubCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const profile =
      req.user as OAuthProfile;

    const result =
      await this.authService.loginWithOAuth(
        profile,
      );

    this.setSessionCookie(
      res,
      result.accessToken.token,
      result.accessToken.expiresAt,
    );

    const returnTo =
      req.cookies?.oauth_return_to as
        | string
        | undefined;

    console.log(
      'GitHub OAuth returnTo:',
      returnTo,
    );

    res.clearCookie(
      'oauth_return_to',
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/auth',
      },
    );

    return res.redirect(
      `${env.webOrigin}${returnTo || '/'}`,
    );
  }

  // ============================================================
  // Current User
  // ============================================================

  @Get('me')
  @ApiOperation({
    summary:
      'Get current user / 取得目前使用者',
    description:
      '驗證 HttpOnly `access_token` cookie，並回傳目前登入的 ACTIVE 使用者。',
  })
  @ApiResponse({
    status: 200,
    description:
      'Access token verified and current user returned.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Access token is missing, invalid, expired, or user is inactive.',
  })
  async me(@Req() req: Request) {
    const cookieToken = req.cookies?.access_token as string | undefined;
    const authorization = req.headers.authorization;
    const bearerToken = typeof authorization === 'string'
      && authorization.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length).trim()
      : undefined;
    const token = cookieToken ?? bearerToken;

    if (!token) {
      throw new UnauthorizedException({
        message: {
          en: 'Access token is missing',
          zh: '缺少 Access Token',
        },
      });
    }

    return this.authService.validateAccessToken(
      token,
    );
  }

  // ============================================================
  // Logout
  // ============================================================

  @Post('logout')
  @ApiOperation({
    summary: 'Logout / 登出',
    description:
      '清除瀏覽器中的 JWT HttpOnly Cookie。已簽發的 JWT 仍會持續有效直到過期。',
  })
  @ApiResponse({
    status: 200,
    description: 'JWT cookie cleared.',
  })
  logout(
    @Res({ passthrough: true })
    res: Response,
  ) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain:
        process.env.NODE_ENV === 'production'
          ? '.xingfan-studio.com'
          : undefined,
      path: '/',
    });

    return {
      success: true,
    };
  }

  // ============================================================
  // Helpers
  // ============================================================

  /**
   * 驗證 OAuth 登入完成後的 Redirect Path。
   *
   * 只允許站內相對路徑，例如：
   *
   * /login
   * /docs
   * /drawer/123
   * /booking/456?foo=abc
   *
   * 不允許：
   *
   * https://example.com
   * //example.com
   */
  private getSafeReturnTo(
    returnTo?: string,
  ): string {
    if (!returnTo) {
      return '/';
    }

    if (!returnTo.startsWith('/')) {
      return '/';
    }

    if (returnTo.startsWith('//')) {
      return '/';
    }

    return returnTo;
  }

  /**
   * 將 Access Token 放入 HttpOnly Cookie。
   */
  private setSessionCookie(
    res: Response,
    token: string,
    expiresAt: Date,
  ) {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain:
        process.env.NODE_ENV === 'production'
          ? '.xingfan-studio.com'
          : undefined,
      expires: expiresAt,
      path: '/',
    });
  }
}

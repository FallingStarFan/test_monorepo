import { Injectable } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';

import env from './env.js';

@Injectable()
export class AuthCookieService {
  private readonly sharedOptions: CookieOptions = {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    domain: env.cookieDomain,
  };

  setLoginCookies(
    response: Response,
    tokens: {
      accessToken: string;
      refreshToken: string;
    },
  ): void {
    response.cookie(env.accessCookieName, tokens.accessToken, {
      ...this.sharedOptions,
      maxAge: env.accessCookieMaxAgeMs,
      path: '/',
    });
    response.cookie(env.refreshCookieName, tokens.refreshToken, {
      ...this.sharedOptions,
      maxAge: env.refreshCookieMaxAgeMs,
      path: '/api/auth',
    });
  }

  clearLoginCookies(response: Response): void {
    response.clearCookie(env.accessCookieName, {
      ...this.sharedOptions,
      path: '/',
    });
    response.clearCookie(env.refreshCookieName, {
      ...this.sharedOptions,
      path: '/api/auth',
    });
  }

  setOAuthCookie(response: Response, name: string, value: string): void {
    response.cookie(name, value, {
      ...this.sharedOptions,
      // OAuth callbacks are top-level cross-site navigations. Lax sends the
      // state cookie without permitting ordinary cross-site mutation requests.
      sameSite: 'lax',
      maxAge: env.oauthCookieMaxAgeMs,
      path: '/api/auth',
    });
  }

  clearOAuthCookie(response: Response, name: string): void {
    response.clearCookie(name, {
      ...this.sharedOptions,
      sameSite: 'lax',
      path: '/api/auth',
    });
  }
}

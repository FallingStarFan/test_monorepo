import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

import env from '@/config/env.js';

/**
 * 驗證 OAuth 回呼(callback)時的 state 參數，用來防止 CSRF 攻擊。
 *
 * 流程說明：
 * 1. 使用者點擊「Google / GitHub 登入」時，後端會產生一組隨機 state，
 *    同時寫進 cookie，並帶在導向 OAuth 提供者的網址上。
 * 2. OAuth 提供者驗證完成後，會把使用者導回 callback 網址，並原封不動帶回 state。
 * 3. 這個函式比對「網址上的 state」與「cookie 裡的 state」是否一致，
 *    一致才代表這次回呼是由我們自己發起的登入流程。
 *
 * @returns 驗證通過的 state 字串，交給 passport 使用
 * @throws UnauthorizedException 任一 state 缺少或不一致時拋出
 */
function validateOAuthState(context: ExecutionContext): string {
  const request = context.switchToHttp().getRequest<Request>();

  // 從網址 query 取得 state；若不是字串(例如被塞成陣列或物件)就視為無效
  const queryState =
    typeof request.query.state === 'string' ? request.query.state : undefined;

  // 從 cookie 取得先前存下來的 state，cookie 名稱由環境設定決定
  // (需要 cookie-parser 才能讀到 request.cookies)
  const cookieState = request.cookies?.[env.oauthStateCookieName] as
    string | undefined;

  // 兩邊只要有一邊沒有值，就不可能通過驗證
  if (!queryState || !cookieState) throw invalidState();

  const queryBuffer = Buffer.from(queryState);
  const cookieBuffer = Buffer.from(cookieState);

  // 用 timingSafeEqual 做「定時比對」，避免攻擊者藉由比對耗時差異猜出 state。
  // 注意：timingSafeEqual 要求兩個 Buffer 長度相同，否則會直接拋錯，
  // 所以要先比長度；長度不同本身就代表不一致。
  if (
    queryBuffer.length !== cookieBuffer.length ||
    !timingSafeEqual(queryBuffer, cookieBuffer)
  ) {
    throw invalidState();
  }

  return queryState;
}

/**
 * 建立 state 驗證失敗時的錯誤(HTTP 401)。
 * message 採用中英雙語物件，方便前端依語系顯示。
 */
function invalidState() {
  return new UnauthorizedException({
    message: {
      en: 'Invalid OAuth state',
      zh: 'OAuth state 驗證失敗',
    },
  });
}

/**
 * Google OAuth 登入守衛。
 * 掛在 Google 的登入與 callback 路由上，會觸發 GoogleStrategy('google')，
 * 並在導向 / 回呼時帶上經過驗證的 state。
 */
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor() {
    super();
  }

  /**
   * 覆寫 passport 的驗證選項。
   * 這裡回傳的 state 會被 passport 附加到導向 Google 的網址(或用於回呼比對)，
   * 在此之前先呼叫 validateOAuthState 確保 state 合法。
   */
  override getAuthenticateOptions(context: ExecutionContext) {
    return { state: validateOAuthState(context) };
  }
}

/**
 * GitHub OAuth 登入守衛。
 * 行為與 GoogleOAuthGuard 相同，差別只在對應的 strategy 名稱是 'github'。
 */
@Injectable()
export class GithubOAuthGuard extends AuthGuard('github') {
  constructor() {
    super();
  }

  /** 同 GoogleOAuthGuard：先驗證 state 再交給 passport */
  override getAuthenticateOptions(context: ExecutionContext) {
    return { state: validateOAuthState(context) };
  }
}
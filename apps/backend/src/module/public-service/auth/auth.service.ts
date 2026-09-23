import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { UserStatus } from '../prisma.js';
import { OauthAccountService } from './oauth/oauth-accounts.service.js';
import { UserPasswordService } from './passwords/user-passwords.service.js';
import { JwtAuthService } from './services/jwt/jwt.service.js';
import { UserService } from './users/users.service.js';


export interface OAuthProfile {
  provider: string;
  providerAccountId: string;
  email?: string;
  name?: string;
  image?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userPasswordService: UserPasswordService,
    private readonly oauthAccountService: OauthAccountService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  // ============================================================
  // Password
  // ============================================================

  /**
   * 使用 Email + Password 登入
   *
   * 流程：
   * 1. UserService 找 User
   * 2. UserPasswordService 找 Password
   * 3. bcrypt 驗證密碼
  * 4. JwtAuthService 簽發 Access Token
   *
   * 為什麼：
   * AuthService 負責「登入流程」，
   * 各資料表則由自己的 Service 負責。
   */
  async loginWithPassword(
    email: string,
    password: string,
  ) {
    // 1. 找 User
    const user =
      await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException({
        message: {
          en: 'Invalid email or password',
          zh: 'Email 或密碼錯誤',
        },
      });
    }

    // 2. 檢查帳號狀態
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({
        message: {
          en: 'User account is not active',
          zh: '使用者帳號目前無法登入',
        },
      });
    }

    // 3. 找 Password
    const userPassword =
      await this.userPasswordService.findByUserId(
        user.id,
      );

    if (!userPassword) {
      throw new UnauthorizedException({
        message: {
          en: 'Invalid email or password',
          zh: 'Email 或密碼錯誤',
        },
      });
    }

    // 4. 驗證 Password
    const passwordValid =
      await bcrypt.compare(
        password,
        userPassword.passwordHash,
      );

    if (!passwordValid) {
      throw new UnauthorizedException({
        message: {
          en: 'Invalid email or password',
          zh: 'Email 或密碼錯誤',
        },
      });
    }

    // 5. 簽發 Access Token
    return this.createLoginResult(user.id, user);
  }

  // ============================================================
  // Register
  // ============================================================

  /**
   * 建立帳密帳號
   *
   * 流程：
   * 1. UserService 建立 User
   * 2. AuthService Hash Password
   * 3. UserPasswordService 建立 Password
  * 4. JwtAuthService 簽發登入 Access Token
   */
  async register(
    email: string,
    password: string,
    name?: string,
  ) {
    // 1. 確認 Email 是否已存在
    const existingUser =
      await this.userService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException({
        message: {
          en: 'Email already exists',
          zh: 'Email 已經存在',
        },
      });
    }

    // 2. 建立 User
    const user =
      await this.userService.create({
        email,
        name,
      });

    // 3. Hash Password
    const passwordHash =
      await bcrypt.hash(password, 12);

    // 4. 建立 UserPassword
    await this.userPasswordService.create(
      user.id,
      passwordHash,
    );

    // 5. 簽發 Access Token
    return this.createLoginResult(
      user.id,
      user,
    );
  }

  // ============================================================
  // OAuth
  // ============================================================

  /**
   * Google / GitHub / 其他 OAuth 登入
   *
   * Strategy 負責：
   * - OAuth Provider 驗證
   * - 取得 Provider Account ID
   * - 取得 email / name / image
   *
   * AuthService 負責：
   * - 找 OAuth Account
   * - 找 / 建立 User
   * - 綁定 OAuth Account
   * - 建立 Session
   */
  async loginWithOAuth(
    profile: OAuthProfile,
  ) {
    // ----------------------------------------------------------
    // 1. 找 OAuth Account
    // ----------------------------------------------------------

    const account =
      await this.oauthAccountService.findByProviderAccount(
        profile.provider,
        profile.providerAccountId,
      );

    // ----------------------------------------------------------
    // 2. OAuth Account 已存在
    // ----------------------------------------------------------

    if (account) {
      const user =
        await this.userService.findById(
          account.userId,
        );

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException({
          message: {
            en: 'User account is not active',
            zh: '使用者帳號目前無法登入',
          },
        });
      }

      return this.createLoginResult(
        user.id,
        user,
      );
    }

    // ----------------------------------------------------------
    // 3. OAuth Account 不存在
    // ----------------------------------------------------------

    let user = null;

    // 有 email 才嘗試尋找既有 User
    if (profile.email) {
      user =
        await this.userService.findByEmail(
          profile.email,
        );
    }

    // ----------------------------------------------------------
    // 4. User 不存在 → 建立 User
    // ----------------------------------------------------------

    if (!user) {
      user =
        await this.userService.create({
          email: profile.email,
          emailVerified: !!profile.email,
          name: profile.name,
          image: profile.image,
        });
    }

    // ----------------------------------------------------------
    // 5. 綁定 OAuth Account
    // ----------------------------------------------------------

    await this.oauthAccountService.create({
      userId: user.id,
      provider: profile.provider,
      providerAccountId:
        profile.providerAccountId,
      email: profile.email,
    });

    // ----------------------------------------------------------
    // 6. 檢查 User Status
    // ----------------------------------------------------------

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({
        message: {
          en: 'User account is not active',
          zh: '使用者帳號目前無法登入',
        },
      });
    }

    // ----------------------------------------------------------
    // 7. 簽發 Access Token
    // ----------------------------------------------------------

    return this.createLoginResult(
      user.id,
      user,
    );
  }

  // ============================================================
  // Access Token
  // ============================================================

  /**
  * 建立登入結果與 Access Token
   *
   * 為什麼：
   * AuthService 負責產生登入 Token，
  * JwtAuthService 負責簽發 Access Token。
   */
  private async createLoginResult(
    userId: string,
    user: any,
  ) {
    // 產生真正放進 Cookie 的 Token
    const accessToken =
      await this.jwtAuthService.issueAccessToken(userId);

    return {
      user,
      accessToken: {
        token: accessToken.token,
        expiresAt: accessToken.expiresAt,
      },
    };
  }

  /**
  * Validate Access Token
   *
   * 流程：
  * 1. JwtAuthService 驗證 Access Token
   * 3. UserService 找 User
  * 3. 檢查 User Status
   */
  async validateAccessToken(token: string) {
    const accessToken =
      await this.jwtAuthService.verifyAccessToken(token);

    // UserService 負責查 User
    const user =
      await this.userService.findById(
        accessToken.userId,
      );

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({
        message: {
          en: 'User account is not active',
          zh: '使用者帳號目前無法使用',
        },
      });
    }

    return {
      user,
      accessToken: {
        expiresAt: accessToken.expiresAt,
      },
    };
  }

}
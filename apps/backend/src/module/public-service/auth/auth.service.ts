import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserStatus } from '../prisma.js';
import { JwtAuthService } from './services/jwt/jwt.service.js';
import { OauthAccountService } from './services/oauth-accounts.service.js';
import { UserPasswordService } from './services/user-passwords.service.js';
import { UserService } from './services/users.service.js';

export interface OAuthProfile {
  provider: 'google' | 'github';
  providerAccountId: string;
  email?: string;
  emailVerified: boolean;
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

  /**
   * 使用 Email 與密碼登入。
   */
  async loginWithPassword(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw this.invalidCredentials();
    }

    this.assertActiveUser(user.status);

    const userPassword = await this.userPasswordService.findByUserId(user.id);

    if (
      !userPassword ||
      !(await bcrypt.compare(password, userPassword.passwordHash))
    ) {
      throw this.invalidCredentials();
    }

    return this.createLoginResult(user.id, user);
  }

  /**
   * 註冊使用者並直接登入。
   */
  async register(email: string, password: string, name?: string) {
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException({
        message: {
          en: 'Email already exists',
          zh: 'Email 已經存在',
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.userService.create({
      email,
      name,
    });

    await this.userPasswordService.create(user.id, passwordHash);

    return this.createLoginResult(user.id, user);
  }

  /**
   * 使用 Google 或 GitHub 帳號登入。
   */
  async loginWithOAuth(profile: OAuthProfile) {
    const account = await this.oauthAccountService.findByProviderAccount(
      profile.provider,
      profile.providerAccountId,
    );

    if (account) {
      const user = await this.userService.findById(account.userId);

      if (!user) {
        throw new UnauthorizedException('使用者不存在');
      }

      this.assertActiveUser(user.status);

      return this.createLoginResult(user.id, user);
    }

    let user = profile.email
      ? await this.userService.findByEmail(profile.email)
      : null;

    // 未驗證的 OAuth Email 不可自動連結既有帳號。
    if (user && !profile.emailVerified) {
      throw new UnauthorizedException({
        message: {
          en: 'This OAuth email cannot be linked automatically',
          zh: '此 OAuth Email 無法自動連結既有帳號',
        },
      });
    }

    if (!user) {
      user = await this.userService.create({
        email: profile.email,
        emailVerified: profile.emailVerified,
        name: profile.name,
        image: profile.image,
      });
    }

    this.assertActiveUser(user.status);

    await this.oauthAccountService.create({
      userId: user.id,
      provider: profile.provider,
      providerAccountId: profile.providerAccountId,
      email: profile.email,
    });

    return this.createLoginResult(user.id, user);
  }

  /**
   * 驗證 refresh JWT，簽發新的 access JWT 與 refresh JWT。
   */
  async refresh(refreshToken: string) {
    const verified =
      await this.jwtAuthService.verifyRefreshToken(refreshToken);

    const user = await this.userService.findById(verified.userId);

    if (!user) {
      throw new UnauthorizedException('使用者不存在');
    }

    this.assertActiveUser(user.status);

    const [accessToken, nextRefreshToken] = await Promise.all([
      this.jwtAuthService.issueAccessToken(user.id),
      this.jwtAuthService.issueRefreshToken(user.id),
    ]);

    return {
      accessToken,
      refreshToken: nextRefreshToken,
    };
  }

  /**
   * 純 JWT 沒有伺服器端 Session 可以撤銷。
   * 登出時由 Controller 清除 access 與 refresh Cookie。
   */
  async logout(): Promise<void> {
    return;
  }

  /**
   * 驗證 access JWT，並取得目前仍有效的使用者資料。
   */
  async validateAccessToken(token: string) {
    const verified =
      await this.jwtAuthService.verifyAccessToken(token);

    const user = await this.userService.findById(verified.userId);

    if (!user) {
      throw new UnauthorizedException('使用者不存在');
    }

    this.assertActiveUser(user.status);

    return {
      user,
      accessToken: {
        expiresAt: verified.expiresAt,
      },
    };
  }

  /**
   * 依已驗證的 userId 取得目前使用者。
   */
  async getCurrentUser(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('使用者不存在');
    }

    this.assertActiveUser(user.status);

    return user;
  }

  /**
   * 登入成功後簽發兩種 JWT。
   */
  private async createLoginResult(
    userId: string,
    user: NonNullable<Awaited<ReturnType<UserService['findById']>>>,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtAuthService.issueAccessToken(userId),
      this.jwtAuthService.issueRefreshToken(userId),
    ]);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  private assertActiveUser(status: UserStatus): void {
    if (status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({
        message: {
          en: 'User account is not active',
          zh: '使用者帳號目前無法登入',
        },
      });
    }
  }

  private invalidCredentials(): UnauthorizedException {
    return new UnauthorizedException({
      message: {
        en: 'Invalid email or password',
        zh: 'Email 或密碼錯誤',
      },
    });
  }
}
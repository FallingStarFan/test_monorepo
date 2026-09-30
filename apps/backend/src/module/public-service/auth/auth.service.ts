// auth.service.ts
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserStatus } from '../prisma.js';
import { JwtAuthService } from './guard/jwt.service.js';
import { OauthAccountsService } from './tables/oauth/oauth-accounts.service.js';
import { UserPasswordsService } from './tables/user-passwords/user-passwords.service.js';

import { AuthRolesService } from './tables/user-role/auth-role.service.js';
import { UsersService } from './tables/users/users.service.js';

export interface OAuthProfile {
  provider: 'google' | 'github';
  providerAccountId: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
  image?: string;
}

/**
 * 處理帳密與 OAuth 登入、JWT 更新，以及目前使用者查詢。
 *
 * 登入成功時回傳的 roles 已整理成 AuthRoleData[]：
 * [{ appName: 'xingfan-studio', roleName: ['ADMIN', 'USER'] }]
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly authRolesService: AuthRolesService,
    private readonly userPasswordService: UserPasswordsService,
    private readonly oauthAccountService: OauthAccountsService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  /**
   * 使用 Email 與密碼登入。
   *
   * 帳密驗證成功後，取得角色並簽發 access、refresh JWT。
   */
  async loginWithPassword(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw this.invalidCredentials();
    }

    this.assertActiveUser(user.status);

    const userPassword = await this.userPasswordService.findByUserId(
      user.id,
    );

    if (
      !userPassword ||
      !(await bcrypt.compare(password, userPassword.passwordHash))
    ) {
      throw this.invalidCredentials();
    }

    return this.createLoginResult(user.id, user);
  }

  /**
   * 建立帳密帳號並直接登入。
   *
   * 新帳號尚未指派角色時，登入回應的 roles 會是 []。
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
   *
   * 已綁定 OAuth 帳號時使用對應使用者；
   * 未綁定時，依已驗證的 Email 連結既有帳號，或建立新使用者。
   */
  async loginWithOAuth(profile: OAuthProfile) {
    const account =
      await this.oauthAccountService.findByProviderAccount(
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

    // OAuth 提供者未確認 Email 時，不自動連結同 Email 的既有帳號。
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
   * 驗證 refresh JWT，並簽發新的 access 與 refresh JWT。
   *
   * 此端點只回傳 token 資訊，不需要查詢角色。
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
   * 驗證 access JWT，並確認使用者目前仍可登入。
   *
   * 若 JwtAuthGuard 正在呼叫此方法，維持此回傳格式，
   * 讓 guard 取得 user 與 access token 到期時間。
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
   * 依 guard 已驗證的 userId，取得 /auth/me 所需資料。
   *
   * 沒有指派角色時回傳 roles: []，不視為登入失敗。
   */
  async getCurrentUserWithRoles(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('使用者不存在');
    }

    this.assertActiveUser(user.status);

    const roles = await this.authRolesService.getAuthRoles(userId);

    return { user, roles };
  }
  
  /** 取得目前仍可登入的使用者。 */
  async getCurrentUser(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('使用者不存在');
    }

    this.assertActiveUser(user.status);

    return user;
  }

  /** 取得使用者在各 App 的角色；沒有角色時回傳 []。 */
  async getCurrentUserRoles(userId: string) {
    return this.authRolesService.getAuthRoles(userId);
  }



  /**
   * 登入成功後，查詢各 App 的角色並簽發兩種 JWT。
   *
   * roles 是 API 回應資料；目前不會寫入 JWT payload。
   */
  private async createLoginResult(
    userId: string,
    user: NonNullable<
      Awaited<ReturnType<UsersService['findById']>>
    >,
  ) {
    const [roles, accessToken, refreshToken] = await Promise.all([
      this.authRolesService.getAuthRoles(userId),
      this.jwtAuthService.issueAccessToken(userId),
      this.jwtAuthService.issueRefreshToken(userId),
    ]);

    return {
      user,
      roles,
      accessToken,
      refreshToken,
    };
  }

  /** 拒絕停用或封鎖的使用者登入。 */
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

  /** 統一帳密錯誤訊息，避免透露 Email 是否存在。 */
  private invalidCredentials(): UnauthorizedException {
    return new UnauthorizedException({
      message: {
        en: 'Invalid email or password',
        zh: 'Email 或密碼錯誤',
      },
    });
  }
}
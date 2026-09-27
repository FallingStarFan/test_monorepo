import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'node:crypto';

import { UserStatus } from '../prisma.js';
import { OauthAccountService } from './oauth/oauth-accounts.service.js';
import { UserPasswordService } from './passwords/user-passwords.service.js';
import { JwtAuthService } from './services/jwt/jwt.service.js';
import { SessionService } from './sessions/sessions.service.js';
import { UserService } from './users/users.service.js';

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
    private readonly sessionService: SessionService,
  ) {}

  async loginWithPassword(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) throw this.invalidCredentials();

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

    const user = await this.userService.create({
      email,
      name,
    });
    const passwordHash = await bcrypt.hash(password, 12);

    await this.userPasswordService.create(user.id, passwordHash);

    return this.createLoginResult(user.id, user);
  }

  async loginWithOAuth(profile: OAuthProfile) {
    const account = await this.oauthAccountService.findByProviderAccount(
      profile.provider,
      profile.providerAccountId,
    );

    if (account) {
      const user = await this.userService.findById(account.userId);
      this.assertActiveUser(user.status);
      return this.createLoginResult(user.id, user);
    }

    let user = profile.email
      ? await this.userService.findByEmail(profile.email)
      : null;

    // Linking by an unverified provider email would let an attacker claim an
    // existing password account. Such accounts must be linked explicitly later.
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

  async refresh(refreshToken: string) {
    const verified = await this.jwtAuthService.verifyRefreshToken(refreshToken);
    const user = await this.userService.findById(verified.userId);

    try {
      this.assertActiveUser(user.status);
    } catch (error) {
      await this.sessionService.revoke(verified.sessionId, verified.userId);
      throw error;
    }

    const nextRefreshToken = await this.jwtAuthService.issueRefreshToken(
      verified.userId,
      verified.sessionId,
    );

    await this.sessionService.rotateRefreshToken({
      id: verified.sessionId,
      userId: verified.userId,
      currentTokenHash: this.hashToken(refreshToken),
      nextTokenHash: this.hashToken(nextRefreshToken.token),
      nextExpiresAt: nextRefreshToken.expiresAt,
    });

    const accessToken = await this.jwtAuthService.issueAccessToken(
      verified.userId,
      verified.sessionId,
    );

    return {
      accessToken,
      refreshToken: nextRefreshToken,
    };
  }

  async logout(tokens: {
    accessToken?: string;
    refreshToken?: string;
  }): Promise<void> {
    let session:
      | {
          sessionId: string;
          userId: string;
        }
      | undefined;

    if (tokens.refreshToken) {
      try {
        session = await this.jwtAuthService.verifyRefreshToken(
          tokens.refreshToken,
        );
      } catch {
        // A missing/expired refresh cookie must not prevent clearing cookies.
      }
    }

    if (!session && tokens.accessToken) {
      try {
        session = await this.jwtAuthService.verifyAccessToken(
          tokens.accessToken,
        );
      } catch {
        // Logout is idempotent even when credentials are already invalid.
      }
    }

    if (session) {
      await this.sessionService.revoke(session.sessionId, session.userId);
    }
  }

  async validateAccessToken(token: string) {
    const accessToken = await this.jwtAuthService.verifyAccessToken(token);
    const user = await this.userService.findById(accessToken.userId);

    this.assertActiveUser(user.status);

    return {
      user,
      accessToken: {
        expiresAt: accessToken.expiresAt,
      },
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userService.findById(userId);
    this.assertActiveUser(user.status);
    return user;
  }

  private async createLoginResult(
    userId: string,
    user: Awaited<ReturnType<UserService['findById']>>,
  ) {
    const sessionId = randomUUID();
    const refreshToken = await this.jwtAuthService.issueRefreshToken(
      userId,
      sessionId,
    );

    await this.sessionService.create(
      sessionId,
      userId,
      this.hashToken(refreshToken.token),
      refreshToken.expiresAt,
    );

    const accessToken = await this.jwtAuthService.issueAccessToken(
      userId,
      sessionId,
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
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

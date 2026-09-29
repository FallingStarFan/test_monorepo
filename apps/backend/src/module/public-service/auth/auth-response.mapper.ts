import { Injectable } from '@nestjs/common';

import type {
  AuthSessionData,
  AuthUser,
  AuthRoleData,
} from '@test/shared';

/**
 * 後端查出的使用者資料。
 *
 * 欄位與公開的 AuthUser 相同，但資料庫查出的日期仍是 Date；
 * 因此不能直接把它當成 AuthUser 回傳。
 */
type DatabaseUser = Omit<AuthUser, 'createdAt' | 'updatedAt'> & {
  createdAt: Date;
  updatedAt: Date;
};

/**
 * 將後端資料整理成前後端共用的 API 格式。
 *
 * 只明確挑選允許公開的使用者欄位，
 * 並在回傳 JSON 前將 Date 轉成 ISO 8601 字串。
 */
@Injectable()
export class AuthResponseMapper {
  /**
   * 建立註冊、登入及 /auth/me 使用的回應資料。
   *
   * @param user 後端查出的使用者，日期欄位為 Date
   * @param roles 使用者在各 App 中擁有的角色
   * @param expiresAt 目前 access token 的到期時間
   */
  toSessionData(
    user: DatabaseUser,
    roles: AuthRoleData[],
    expiresAt: Date,
  ): AuthSessionData {
    const authUser: AuthUser = {  // 因為涉及資料安全，不能展開user
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
      user: authUser,
      roles,
      accessToken: {
        expiresAt: expiresAt.toISOString(),
      },
    };
  }
}
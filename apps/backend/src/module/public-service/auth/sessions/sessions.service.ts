import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.js';



@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create session.
   *
   * 為什麼：
   * 使用者登入成功後，需要建立一個 Session，
   * 用來管理這次登入狀態與過期時間。
   */
  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return this.prisma.session.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  /**
   * Find active session.
   *
   * 為什麼：
   * 驗證 Session 時，必須同時確認：
   *
   * 1. Token Hash 正確
   * 2. 沒有被撤銷
   * 3. 尚未過期
   */
  async findActiveByTokenHash(tokenHash: string) {
    return this.prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  /**
   * Revoke session.
   *
   * 為什麼：
   * 登出時不直接刪除 Session，
   * 而是設定 revokedAt，保留 Session 紀錄。
   */
  async revoke(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!session) {
      throw new NotFoundException({
        message: {
          en: 'Session not found',
          zh: '找不到登入 Session',
        },
      });
    }

    return this.prisma.session.update({
      where: { id },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Revoke all sessions.
   *
   * 為什麼：
   * 當使用者選擇「全部裝置登出」時，
   * 可以一次撤銷所有尚未撤銷的 Session。
   */
  async revokeAllByUserId(userId: string) {
    return this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Delete expired sessions.
   *
   * 為什麼：
   * 過期 Session 已經沒有使用價值，
   * 可以定期清理來避免資料庫一直累積。
   */
  async deleteExpired() {
    return this.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}


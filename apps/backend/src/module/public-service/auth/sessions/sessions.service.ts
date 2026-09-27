import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../../prisma.js';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(id: string, userId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.session.create({
      data: {
        id,
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findActiveById(id: string, userId: string) {
    return this.prisma.session.findFirst({
      where: {
        id,
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

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
   * Rotate a refresh token with compare-and-swap semantics.
   *
   * If a validly signed old token is replayed after rotation, the hash differs
   * from the current value and the whole device session is revoked.
   */
  async rotateRefreshToken(input: {
    id: string;
    userId: string;
    currentTokenHash: string;
    nextTokenHash: string;
    nextExpiresAt: Date;
  }): Promise<void> {
    const now = new Date();
    const updated = await this.prisma.session.updateMany({
      where: {
        id: input.id,
        userId: input.userId,
        tokenHash: input.currentTokenHash,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        tokenHash: input.nextTokenHash,
        expiresAt: input.nextExpiresAt,
      },
    });

    if (updated.count === 1) return;

    const session = await this.prisma.session.findUnique({
      where: { id: input.id },
      select: {
        userId: true,
        tokenHash: true,
        revokedAt: true,
      },
    });

    if (
      session &&
      session.userId === input.userId &&
      session.revokedAt === null &&
      session.tokenHash !== input.currentTokenHash
    ) {
      await this.prisma.session.updateMany({
        where: {
          id: input.id,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      });
    }

    throw new UnauthorizedException({
      message: {
        en: 'Invalid, expired, or replayed refresh token',
        zh: 'Refresh Token 無效、已過期或已被重放',
      },
    });
  }

  async revoke(id: string, userId?: string) {
    return this.prisma.session.updateMany({
      where: {
        id,
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

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

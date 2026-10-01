import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService, Prisma } from '@/module/public-service/prisma.js';
import { MESSAGES } from '@/common/response/messages.js';

@Injectable()
export class OauthAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find OAuth account by provider account.
   *
   * 為什麼：
   * OAuth 登入時，Provider + Provider Account ID
   * 可以唯一識別第三方帳號，因此用這兩個欄位查詢。
   *
   * 例如：
   * Google + 123456789
   */
  async findByProviderAccount(provider: string, providerAccountId: string) {
    return this.prisma.oauthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    });
  }

  /**
   * Find all OAuth accounts of a user.
   *
   * 為什麼：
   * 一個 User 可以同時綁定 Google、GitHub、Apple 等多個 OAuth 帳號。
   */
  async findByUserId(userId: string) {
    return this.prisma.oauthAccount.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Create OAuth account.
   *
   * 為什麼：
   * OAuth 驗證成功後，需要把第三方帳號與系統 User 建立關聯。
   */
  async create(data: {
    userId: string;
    provider: string;
    providerAccountId: string;
    email?: string;
  }) {
    try {
      return await this.prisma.oauthAccount.create({
        data,
      });
    } catch (error) {
      /**
       * P2002 = Unique constraint violation
       *
       * 為什麼：
       * provider + providerAccountId 已經存在時，
       * 不應該建立第二筆相同的 OAuth 帳號。
       */
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          message: MESSAGES.OAUTH_ACCOUNT_ALREADY_EXISTS,
        });
      }

      throw error;
    }
  }

  /**
   * Delete OAuth account.
   *
   * 為什麼：
   * 提供解除第三方 OAuth 帳號綁定的功能。
   */
  async remove(id: string) {
    const account = await this.prisma.oauthAccount.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!account) {
      throw new NotFoundException({
        message: MESSAGES.OAUTH_ACCOUNT_NOT_FOUND,
      });
    }

    await this.prisma.oauthAccount.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }
}

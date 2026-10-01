import { PrismaService, Prisma } from '@/module/public-service/prisma.js';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MESSAGES } from '@/common/response/messages.js';

@Injectable()
export class UserPasswordsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find password by user ID.
   *
   * 為什麼：
   * UserPassword 與 User 是 1:1 關係，
   * 因此透過 userId 找使用者的密碼資料。
   */
  async findByUserId(userId: string) {
    return this.prisma.userPassword.findUnique({
      where: { userId },
    });
  }

  /**
   * Create password.
   *
   * 為什麼：
   * 使用 Email + Password 註冊時，
   * 需要建立獨立的 UserPassword 資料。
   *
   * 注意：
   * passwordHash 必須已經過 Hash，
   * Service 不應該直接儲存明文密碼。
   */
  async create(userId: string, passwordHash: string) {
    try {
      return await this.prisma.userPassword.create({
        data: {
          userId,
          passwordHash,
        },
      });
    } catch (error) {
      /**
       * P2002 = Unique constraint violation
       *
       * userId 在 UserPassword 中是 unique，
       * 所以一個 User 只能有一筆 Password。
       */
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          message: MESSAGES.USER_PASSWORD_ALREADY_EXISTS,
        });
      }

      throw error;
    }
  }

  /**
   * Update password.
   *
   * 為什麼：
   * 使用者修改密碼時，只需要更新 passwordHash。
   */
  async update(userId: string, passwordHash: string) {
    const password = await this.findByUserId(userId);

    if (!password) {
      throw new NotFoundException({
        message: MESSAGES.USER_PASSWORD_NOT_FOUND,
      });
    }

    return this.prisma.userPassword.update({
      where: {
        userId,
      },
      data: {
        passwordHash,
      },
    });
  }

  /**
   * Delete password.
   *
   * 為什麼：
   * 允許移除 Password 登入方式。
   *
   * 注意：
   * 實際 Auth 邏輯應該確認 User 是否還有其他登入方式，
   * 避免使用者刪除 Password 後完全無法登入。
   */
  async remove(userId: string) {
    const password = await this.findByUserId(userId);

    if (!password) {
      throw new NotFoundException({
        message: MESSAGES.USER_PASSWORD_NOT_FOUND,
      });
    }

    await this.prisma.userPassword.delete({
      where: {
        userId,
      },
    });

    return {
      success: true,
    };
  }
}

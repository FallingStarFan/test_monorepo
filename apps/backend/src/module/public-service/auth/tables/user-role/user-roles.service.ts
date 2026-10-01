import { PrismaService } from '@/module/public-service/prisma.js';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MESSAGES } from '@/common/response/messages.js';

@Injectable()
export class UserRolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 指派角色給使用者。
   * 若已存在相同指派，拋出 409 而不是重複建立。
   */
  async assign(userId: string, roleId: string) {
    const existing = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId },
      },
    });

    if (existing) {
      throw new ConflictException({
        message: MESSAGES.USER_ALREADY_HAS_ROLE,
      });
    }

    return this.prisma.userRole.create({
      data: { userId, roleId },
    });
  }

  /**
   * 移除使用者的角色。
   */
  async revoke(userId: string, roleId: string) {
    try {
      return await this.prisma.userRole.delete({
        where: {
          userId_roleId: { userId, roleId },
        },
      });
    } catch {
      throw new NotFoundException({
        message: MESSAGES.USER_ROLE_NOT_FOUND,
      });
    }
  }

  /**
   * 取得使用者在所有 App 的角色（管理介面用）。
   */
  async findByUser(userId: string) {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: { role: { include: { app: true } } },
    });
  }
}

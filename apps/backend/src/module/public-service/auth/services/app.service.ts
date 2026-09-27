import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma.js';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // 取得所有 App
  async findAll() {
    return this.prisma.app.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  // 取得單一 App
  async findById(id: string) {
    return this.prisma.app.findUnique({
      where: {
        id,
      },
    });
  }

  // ============================================================
  // 管理 API 需要的方法
  // ============================================================

  /**
   * 取得單一 App，找不到時丟 404。
   *
   * 為什麼不改動上面的 findById：
   * findById 回傳 null 是既有行為，其他呼叫端可能依賴這個語意。
   * 管理 API 需要明確的 404 才能讓前端顯示正確訊息，
   * 因此用新方法表達新需求，而不是改動既有方法的行為。
   */
  async findByIdOrFail(id: string) {
    const app = await this.findById(id);

    if (!app) {
      throw new NotFoundException({
        message: {
          en: 'App not found',
          zh: '找不到指定的 App',
        },
      });
    }

    return app;
  }

  /**
   * 建立 App。
   *
   * 為什麼先查再寫：App.name 有唯一約束，若直接依賴資料庫錯誤，
   * 使用者會收到 500 或難懂的 Prisma 例外訊息；
   * 先查一次可以回傳語意明確的 409，前端才能正確提示「名稱重複」。
   */
  async create(
    name: string,
    description?: string,
  ) {
    const existing = await this.prisma.app.findUnique({
      where: {
        name,
      },
    });

    if (existing) {
      throw new ConflictException({
        message: {
          en: 'App name already exists',
          zh: 'App 名稱已存在',
        },
      });
    }

    return this.prisma.app.create({
      data: {
        name,
        description,
      },
    });
  }

  /** 修改 App；改名時同樣要避開與其他 App 撞名 */
  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
    },
  ) {
    await this.findByIdOrFail(id);

    if (data.name !== undefined) {
      const existing = await this.prisma.app.findUnique({
        where: {
          name: data.name,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException({
          message: {
            en: 'App name already exists',
            zh: 'App 名稱已存在',
          },
        });
      }
    }

    return this.prisma.app.update({
      where: {
        id,
      },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
    });
  }

  /**
   * 刪除 App。
   *
   * 為什麼要額外統計角色數：App 底下的角色會因為 onDelete: Cascade 一起消失，
   * 若只回傳被刪除的 App，呼叫端無法察覺「這次刪除連帶移除了多少角色」。
   * 回應帶上數量，讓刪除的影響範圍對使用者是可見的。
   */
  async remove(id: string) {
    const app = await this.findByIdOrFail(id);

    const cascadedRoleCount =
      await this.prisma.role.count({
        where: {
          appId: app.id,
        },
      });

    const deleted = await this.prisma.app.delete({
      where: {
        id,
      },
    });

    return {
      ...deleted,
      cascadedRoleCount,
    };
  }
}

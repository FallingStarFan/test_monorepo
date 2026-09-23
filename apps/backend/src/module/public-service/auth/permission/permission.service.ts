import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/module/public-service/prisma.js';

import { DEFAULT_APP_SCOPE } from './permission.constants.js';

/**
 * 使用者在某個 App 的存取範圍。
 *
 * 為什麼不直接回傳 Prisma 的關聯物件：Guard 需要的是「扁平、已去重」的
 * 角色名稱與權限碼清單，前端也只需要這幾個欄位。先在 Service 收斂成一個
 * 穩定的形狀，Guard 與 Controller 就不必理解 Prisma 的巢狀結構。
 */
export interface UserAppAccess {
  appId: string | null;
  appName: string;
  roles: {
    id: string;
    name: string;
    description: string | null;
  }[];
  roleNames: string[];
  permissionCodes: string[];
}

@Injectable()
export class PermissionService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================
  // 存取範圍查詢
  // ============================================================

  /**
   * 查詢使用者在指定 App 的角色與權限碼。
   *
   * 為什麼用一次 include 查完：
   * 每個受保護的請求都會呼叫這個方法，若拆成「先查角色、再查權限」兩次查詢，
   * 每個請求都要多一趟資料庫往返；一次查完也確保角色與權限來自同一瞬間的快照，
   * 不會出現「角色已刪、權限還在」的中間狀態。
   */
  async findUserAppAccess(
    userId: string,
    appName: string = DEFAULT_APP_SCOPE,
  ): Promise<UserAppAccess> {
    const app = await this.prisma.app.findUnique({
      where: {
        name: appName,
      },
    });

    if (!app) {
      // App 不存在時故意回傳「沒有任何角色」而不是丟 404：
      // Guard 只需要判斷「有沒有角色」，若這裡丟 404 會讓權限檢查的
      // 三種結果（未登入 / 無 App 角色 / 缺權限）混進第四種錯誤，
      // 對前端與使用者都沒有幫助，也讓錯誤語意變得模糊。
      return {
        appId: null,
        appName,
        roles: [],
        roleNames: [],
        permissionCodes: [],
      };
    }

    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
        role: {
          appId: app.id,
        },
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const roles = userRoles.map((userRole) => ({
      id: userRole.role.id,
      name: userRole.role.name,
      description: userRole.role.description,
    }));

    // 同一個權限碼可能由多個角色帶來（例如 ADMIN 與 EDITOR 都有 app:read），
    // 用 Set 去重並排序，讓回傳結果穩定，前端不需要再自行處理重複項。
    const permissionCodes = Array.from(
      new Set(
        userRoles.flatMap((userRole) =>
          userRole.role.permissions.map(
            (rolePermission) => rolePermission.permission.code,
          ),
        ),
      ),
    ).sort();

    return {
      appId: app.id,
      appName,
      roles,
      roleNames: roles.map((role) => role.name),
      permissionCodes,
    };
  }

  // ============================================================
  // Permission CRUD
  // ============================================================

  /** 取得所有權限碼，依 code 排序讓 Swagger 與前端下拉選單有穩定順序 */
  async findAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: {
        code: 'asc',
      },
    });
  }

  /** 取得單一權限碼，找不到時丟 404 而非回傳 null，避免呼叫端誤用 undefined */
  async findPermissionById(permissionId: string) {
    const permission =
      await this.prisma.permission.findUnique({
        where: {
          id: permissionId,
        },
      });

    if (!permission) {
      throw new NotFoundException({
        message: {
          en: 'Permission not found',
          zh: '找不到指定的權限碼',
        },
      });
    }

    return permission;
  }

  /** 建立權限碼；code 必須唯一，否則既有的指派關係會指向不確定的語意 */
  async createPermission(data: {
    code: string;
    name: string;
    description?: string;
  }) {
    const existing =
      await this.prisma.permission.findUnique({
        where: {
          code: data.code,
        },
      });

    if (existing) {
      throw new ConflictException({
        message: {
          en: 'Permission code already exists',
          zh: '權限碼已存在',
        },
      });
    }

    return this.prisma.permission.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
      },
    });
  }

  /** 修改權限碼；只有在真的帶了新 code 時才做重複檢查，省掉一次無意義查詢 */
  async updatePermission(
    permissionId: string,
    data: {
      code?: string;
      name?: string;
      description?: string;
    },
  ) {
    await this.findPermissionById(permissionId);

    if (data.code !== undefined) {
      const existing =
        await this.prisma.permission.findUnique({
          where: {
            code: data.code,
          },
        });

      if (existing && existing.id !== permissionId) {
        throw new ConflictException({
          message: {
            en: 'Permission code already exists',
            zh: '權限碼已存在',
          },
        });
      }
    }

    return this.prisma.permission.update({
      where: {
        id: permissionId,
      },
      data: {
        ...(data.code !== undefined && {
          code: data.code,
        }),
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
   * 刪除權限碼。
   *
   * RolePermission 對 Permission 設定了 onDelete: Cascade，
   * 因此刪除權限碼時指派關係會一併移除，不會留下指向不存在權限的孤兒資料。
   */
  async removePermission(permissionId: string) {
    await this.findPermissionById(permissionId);

    return this.prisma.permission.delete({
      where: {
        id: permissionId,
      },
    });
  }
}

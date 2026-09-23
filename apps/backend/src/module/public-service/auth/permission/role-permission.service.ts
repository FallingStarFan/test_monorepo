import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/module/public-service/prisma.js';

@Injectable()
export class RolePermissionService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================
  // 查詢
  // ============================================================

  /** 取得某個角色目前被指派的權限，找不到角色時直接 404 而不是回空陣列 */
  async findByRole(roleId: string) {
    await this.assertRoleExists(roleId);

    return this.prisma.rolePermission.findMany({
      where: {
        roleId,
      },
      include: {
        permission: true,
      },
      orderBy: {
        permission: {
          code: 'asc',
        },
      },
    });
  }

  // ============================================================
  // 指派
  // ============================================================

  /**
   * 追加指派（冪等）。
   *
   * 為什麼用 createMany + skipDuplicates 而不是逐筆檢查：
   * RolePermission 使用複合主鍵 (roleId, permissionId)，重複指派在資料庫層
   * 本來就不可能成立；交給資料庫跳過重複，Service 就不需要「先查再寫」，
   * 也就不會出現兩個並行請求都通過檢查、最後其中一個失敗的競態。
   */
  async assign(
    roleId: string,
    permissionIds: string[],
  ) {
    await this.assertRoleExists(roleId);

    const uniqueIds = Array.from(new Set(permissionIds));

    await this.assertPermissionsExist(uniqueIds);

    if (uniqueIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: uniqueIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }

    return this.findByRole(roleId);
  }

  /**
   * 整批覆蓋指派。
   *
   * 為什麼一定要包在 transaction：
   * 「先全部刪除、再全部寫入」若中間失敗（例如權限碼剛被別人刪掉），
   * 角色會停在「一個權限都沒有」的狀態，持有該角色的使用者會瞬間全部被鎖在外面。
   * 放進同一個 transaction，失敗就整批回滾，維持改動前的狀態。
   */
  async replace(
    roleId: string,
    permissionIds: string[],
  ) {
    await this.assertRoleExists(roleId);

    const uniqueIds = Array.from(new Set(permissionIds));

    await this.assertPermissionsExist(uniqueIds);

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({
        where: {
          roleId,
        },
      }),
      this.prisma.rolePermission.createMany({
        data: uniqueIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
        skipDuplicates: true,
      }),
    ]);

    return this.findByRole(roleId);
  }

  /**
   * 移除單一權限指派。
   *
   * 指派不存在時回 404 而不是靜默成功：刪除類 API 若一律回成功，
   * 使用者打錯 permissionId 時會以為權限已被收回，實際上什麼都沒發生。
   */
  async revoke(
    roleId: string,
    permissionId: string,
  ) {
    await this.assertRoleExists(roleId);

    const result =
      await this.prisma.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId,
        },
      });

    if (result.count === 0) {
      throw new NotFoundException({
        message: {
          en: 'This role does not have the permission',
          zh: '此角色沒有這個權限',
        },
      });
    }

    return {
      roleId,
      permissionId,
      removed: result.count,
    };
  }

  // ============================================================
  // 內部檢查
  // ============================================================

  /** 為什麼要先檢查角色存在：指派到不存在的 roleId 只會產生孤兒資料 */
  private async assertRoleExists(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new NotFoundException({
        message: {
          en: 'Role not found',
          zh: '找不到指定的角色',
        },
      });
    }

    return role;
  }

  /**
   * 一次查出所有指派的權限碼是否存在，並在錯誤訊息中列出缺少的 id。
   *
   * 為什麼不是逐筆查：一個角色可能一次指派多個權限，逐筆查會產生 N 次往返；
   * 而且回報「哪幾個 id 不存在」比只說「有人不存在」更容易排查。
   */
  private async assertPermissionsExist(
    permissionIds: string[],
  ) {
    if (permissionIds.length === 0) {
      return;
    }

    const permissions =
      await this.prisma.permission.findMany({
        where: {
          id: {
            in: permissionIds,
          },
        },
        select: {
          id: true,
        },
      });

    const foundIds = new Set(
      permissions.map((permission) => permission.id),
    );

    const missingIds = permissionIds.filter(
      (permissionId) => !foundIds.has(permissionId),
    );

    if (missingIds.length > 0) {
      throw new BadRequestException({
        message: {
          en: `Permissions not found: ${missingIds.join(', ')}`,
          zh: `找不到這些權限：${missingIds.join('、')}`,
        },
      });
    }
  }
}

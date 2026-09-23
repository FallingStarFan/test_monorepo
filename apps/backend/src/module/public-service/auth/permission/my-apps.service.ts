import { Injectable } from '@nestjs/common';

import {
  APP_ACCESS_SOURCE,
  CONSOLE_APP_NAME,
  LAUNCHER_APP_ORDER,
  PUBLIC_SERVICE_APP_NAME,
  SYSTEM_ROLE_ADMIN,
  type LauncherApp,
  type MyAppsResponse,
} from '@test/shared';

import { PrismaService } from '@/module/public-service/prisma.js';

/**
 * App 入口清單。
 *
 * 唯一來源是資料庫的 apps 表，加上「登入者在該 App 有沒有角色」；
 * 前端不維護任何寫死的 App 清單，新增 App 只要在資料表補一列就會出現。
 *
 * 可見規則（兩條，缺一不可）：
 * 1. 登入者在該 App 有角色 → 可見（accessSource = role）。
 * 2. 該 App 是控制台，且登入者具備 public-service 的 ADMIN 角色
 *    → 可見（accessSource = platform-admin）。
 *
 * 為什麼規則 2 只針對控制台，而不是讓 ADMIN 看到全部 App：
 * 「看得到別人的 App 卡片」等於洩漏了不屬於他的入口。ADMIN 的平台管理權
 * 只涵蓋管理工具本身（控制台），其餘 App 仍必須先被指派角色才能進入，
 * 這也讓「卡片出現 = 你有這個 App 的角色」成為使用者可以信賴的規則。
 */
@Injectable()
export class MyAppsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 取得指定使用者可進入的 App 清單。
   *
   * 為什麼一次查完 App 表與使用者角色，而不是每個 App 各查一次：
   * 這個方法會在入口頁每次請求時執行，逐一查詢會產生 N+1 次資料庫往返；
   * 兩次查詢後在記憶體中比對，筆數少（App 數量不多）時更單純也更快。
   */
  async findMyApps(userId: string): Promise<MyAppsResponse> {
    const [apps, userRoles] = await Promise.all([
      this.prisma.app.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.userRole.findMany({
        where: {
          userId,
        },
        include: {
          role: {
            include: {
              app: true,
            },
          },
        },
      }),
    ]);

    // 先把角色依 App 分組，後續每個 App 只要查一次 Map，不必重掃角色清單。
    const roleNamesByAppId = new Map<string, string[]>();
    let isPlatformAdmin = false;

    for (const userRole of userRoles) {
      const { appId, name, app } = userRole.role;

      const names = roleNamesByAppId.get(appId) ?? [];
      names.push(name);
      roleNamesByAppId.set(appId, names);

      // 「平台管理權」的判定與 PermissionGuard 一致：
      // 必須是 public-service 這個 App 的 ADMIN 角色，其他 App 的同名角色不算。
      if (
        app.name === PUBLIC_SERVICE_APP_NAME &&
        name === SYSTEM_ROLE_ADMIN
      ) {
        isPlatformAdmin = true;
      }
    }

    const visibleApps: LauncherApp[] = [];

    for (const app of apps) {
      // 同一個角色名稱可能因為資料重整而重複，去重並排序讓回應穩定。
      const roleNames = Array.from(
        new Set(roleNamesByAppId.get(app.id) ?? []),
      ).sort();

      if (roleNames.length > 0) {
        visibleApps.push({
          id: app.id,
          name: app.name,
          description: app.description,
          roleNames,
          accessSource: APP_ACCESS_SOURCE.ROLE,
        });

        continue;
      }

      if (isPlatformAdmin && app.name === CONSOLE_APP_NAME) {
        visibleApps.push({
          id: app.id,
          name: app.name,
          description: app.description,
          roleNames: [],
          accessSource: APP_ACCESS_SOURCE.PLATFORM_ADMIN,
        });
      }
    }

    return {
      isAdmin: isPlatformAdmin,
      apps: sortByLauncherOrder(visibleApps),
    };
  }
}

/**
 * 依入口頁定義的順序排序。
 *
 * 未列在 LAUNCHER_APP_ORDER 的 App 排在最後並依名稱排序，
 * 因此新增 App 時不必回頭修改共用常數也會有穩定的顯示順序。
 */
function sortByLauncherOrder(apps: LauncherApp[]): LauncherApp[] {
  return [...apps].sort((left, right) => {
    const leftIndex = orderIndexOf(left.name);
    const rightIndex = orderIndexOf(right.name);

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.name.localeCompare(right.name);
  });
}

/** 取得 App 在入口頁的排序權重（未定義者排到最後）。 */
function orderIndexOf(name: string): number {
  const index = LAUNCHER_APP_ORDER.indexOf(name);

  return index === -1 ? LAUNCHER_APP_ORDER.length : index;
}

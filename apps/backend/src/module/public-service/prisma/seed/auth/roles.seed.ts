import type { App, Role } from '../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma.service.js';
import { DEFAULT_ROLE_NAMES } from './constants.js';

/**
 * 巢狀對照表：roles['Console']['ADMIN'] -> Role 物件
 * 外層 key 是 App name，內層 key 是 Role name。
 */
export type RoleMap = Record<string, Record<string, Role>>;

/**
 * 幫「每一個」App 都建立一份預設角色（USER、VIP、ADMIN）。
 * 必須在 seedApps 之後執行，因為 Role 需要掛在已存在的 App 底下。
 *
 * appId_name 是 schema 裡的複合唯一鍵，代表「同一個 App 底下角色名稱不可重複」，
 * 但不同 App（Console / Canvas）可以各自擁有自己的 ADMIN，彼此不衝突。
 *
 * @param apps 由 seedApps() 回傳的 App 對照表
 * @returns 巢狀的 Role 對照表，方便 user.seed.ts 直接取用，不用再查資料庫
 */
export async function seedRoles(
  prisma: PrismaService,
  apps: Record<string, App>,
): Promise<RoleMap> {
  console.log('Seeding Roles...');

  const roles: RoleMap = {};

  for (const app of Object.values(apps)) {
    roles[app.name] = {};

    for (const roleName of DEFAULT_ROLE_NAMES) {
      const role = await prisma.role.upsert({
        where: {
          appId_name: {
            appId: app.id,
            name: roleName,
          },
        },
        update: {},
        create: {
          appId: app.id,
          name: roleName,
        },
      });

      roles[app.name][roleName] = role;
    }
  }

  const appCount = Object.keys(apps).length;
  console.log(
    `Roles seed completed. (${DEFAULT_ROLE_NAMES.length} roles x ${appCount} apps)`,
  );

  return roles;
}

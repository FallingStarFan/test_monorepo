import {
  PUBLIC_SERVICE_APP_NAME,
  SYSTEM_ROLE_ADMIN,
} from '@test/shared';

import { PERMISSION_CATALOG } from '../../auth/permission/permission.constants.js';

import type { PrismaService } from '../prisma.service.js';

/**
 * 權限相關的 seed。
 *
 * 為什麼 seed 需要「建立權限碼 + 指派給 ADMIN」：
 *
 * 權限系統有一個先有雞還是先有蛋的問題——管理 API 需要 ADMIN 角色，
 * 而 ADMIN 角色必須先被授予 permission:write 等權限碼才能通過 Guard。
 * 若沒有這段 seed，任何人在全新環境都無法透過 API 建立第一筆權限，
 * 只能手動下 SQL，這對部署與測試都是阻礙。
 *
 * 因此 seed 負責建立「最小可用的管理能力」：public-service App、ADMIN 角色、
 * 目錄中的全部權限碼，並把權限碼指給 ADMIN。
 */
export async function seedPermission(
  prisma: PrismaService,
) {
  console.log('Seeding Permission...');

  // 管理 API 檢查的 App 是 public-service，因此這裡建立它而不是用 system App：
  // 需求明確以「App name = public-service、Role name = ADMIN」表達管理權限，
  // seed 必須建立出同一組資料，否則管理 API 會永遠回 403。
  const app = await prisma.app.upsert({
    where: {
      name: PUBLIC_SERVICE_APP_NAME,
    },
    update: {},
    create: {
      name: PUBLIC_SERVICE_APP_NAME,
      description:
        '公開服務（權限、帳務等共用功能的宿主 App）',
    },
  });

  // 為什麼用 upsert 而不是 create：seed 會被重複執行（本機開發、CI、部署），
  // 重複執行時應更新名稱與說明（清單可能被調整），而不是失敗或產生重複資料。
  for (const entry of PERMISSION_CATALOG) {
    await prisma.permission.upsert({
      where: {
        code: entry.code,
      },
      update: {
        name: entry.name,
        description: entry.description,
      },
      create: {
        code: entry.code,
        name: entry.name,
        description: entry.description,
      },
    });
  }

  const adminRole = await prisma.role.upsert({
    where: {
      appId_name: {
        appId: app.id,
        name: SYSTEM_ROLE_ADMIN,
      },
    },
    update: {},
    create: {
      appId: app.id,
      name: SYSTEM_ROLE_ADMIN,
      description:
        'public-service 的管理者，可執行所有權限管理 API',
    },
  });

  const permissions = await prisma.permission.findMany({
    where: {
      code: {
        in: PERMISSION_CATALOG.map(
          (entry) => entry.code,
        ),
      },
    },
  });

  // skipDuplicates 讓這段 seed 可以重複執行而不會撞到複合主鍵，
  // 也就讓「重跑 seed」變成安全的操作。
  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: adminRole.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });

  // 讓 seed 建立的預設管理員擁有 public-service 的 ADMIN 角色。
  // 即使這個使用者不存在（例如正式環境改用其他帳號），seed 也不應失敗，
  // 因此在找不到時只提示、不中斷。
  const adminUser = await prisma.user.findUnique({
    where: {
      email: 'admin@example.com',
    },
  });

  if (adminUser) {
    await prisma.userRole.createMany({
      data: [
        {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      ],
      skipDuplicates: true,
    });
  } else {
    console.log(
      'Permission seed: admin@example.com not found, skipped role assignment.',
    );
  }

  console.log(
    `Permission seed completed: ${permissions.length} permissions granted to ${SYSTEM_ROLE_ADMIN} of ${PUBLIC_SERVICE_APP_NAME}.`,
  );
}

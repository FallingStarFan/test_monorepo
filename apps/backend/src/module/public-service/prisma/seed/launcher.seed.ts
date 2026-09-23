import {
  CANVAS_APP_NAME,
  CONSOLE_APP_NAME,
} from '@test/shared';

import type { PrismaService } from '../prisma.service.js';

/**
 * seed 只需要 apps 表的存取能力。
 *
 * 為什麼不直接用 PrismaService 當參數型別：
 * PrismaService 額外帶了 Nest 的生命週期方法（onModuleInit 等），
 * 從獨立腳本（scripts/seed-launcher-apps.ts）以純 PrismaClient 呼叫時，
 * 型別會因為缺少這些方法而不相容。只取需要的部分，兩種呼叫端都能用。
 */
type LauncherSeedClient = Pick<PrismaService, 'app'>;

/**
 * App 入口所需的 App 資料列 seed。
 *
 * 為什麼需要這段 seed：
 * 入口頁的卡片完全由資料庫 apps 表決定，因此「控制台」與「Canvas」
 * 必須先有資料列，否則即使程式改好了，入口頁也永遠看不到這兩張卡片。
 *
 * 為什麼控制台不建立角色：
 * 控制台的可見條件是「登入者具備 public-service 的 ADMIN 角色」，
 * 而不是「在 console 這個 App 有角色」。若這裡替 console 建立 ADMIN 角色，
 * 就會出現第二套管理權判定路徑，兩套規則一旦不同步就會產生難以解釋的權限差異。
 *
 * 為什麼 Canvas 也不建立角色：
 * 角色指派屬於「誰可以用這個 App」的業務決定，應由管理員透過
 * /api/admin/apps/:appId/roles 指派；seed 只負責讓 App 存在於資料表中。
 */
export async function seedLauncherApps(
  prisma: LauncherSeedClient,
) {
  console.log('Seeding launcher apps...');

  const launcherApps = [
    {
      name: CONSOLE_APP_NAME,
      description:
        '平台控制台：管理 App、角色與權限（僅 public-service 的 ADMIN 可進入）',
    },
    {
      name: CANVAS_APP_NAME,
      description:
        'Canvas 白板：多人協作的畫布工具（入口已建立，功能開發中）',
    },
  ];

  // 用 upsert 而非 create：seed 會被重複執行（本機、CI、部署），
  // 重複執行時應更新說明文字而不是失敗或產生重複資料。
  for (const app of launcherApps) {
    await prisma.app.upsert({
      where: {
        name: app.name,
      },
      update: {
        description: app.description,
      },
      create: {
        name: app.name,
        description: app.description,
      },
    });
  }

  console.log(
    `Launcher seed completed: ${launcherApps.map((app) => app.name).join(', ')}.`,
  );
}

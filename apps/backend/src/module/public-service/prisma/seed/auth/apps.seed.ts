import type { App } from '../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma.service.js';
import { APP_NAMES } from './constants.js';

/**
 * 註冊系統內所有的 App（目前是 Console、Canvas）。
 *
 * 用 upsert：App 不存在就建立；已存在就不動它（update: {}），
 * 所以這個函式可以放心重複執行，不會造成重複資料。
 *
 * @returns 以 App name 當 key 的對照表，例如 apps['Console']，
 *          讓後面的 roles.seed.ts 不用再重新查一次資料庫就能拿到 App id。
 */
export async function seedApps(
  prisma: PrismaService,
): Promise<Record<string, App>> {
  console.log('Seeding Apps...');

  const apps: Record<string, App> = {};

  for (const name of APP_NAMES) {
    const app = await prisma.app.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    apps[name] = app;
  }

  console.log(`Apps seed completed. (${APP_NAMES.length} apps)`);

  return apps;
}

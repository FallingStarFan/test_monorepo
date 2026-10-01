import type { PrismaService } from '../../prisma.service.js';
import { seedApps } from './apps.seed.js';
import { seedRoles } from './roles.seed.js';
import { seedUser } from './user.seed.js';

// 統一 export：外部只要 `import { seedApps, seedRoles, seedUser, ... } from './seed/index.js'`
// 就好，不用知道每個函式分別放在哪個檔案裡。
export * from './constants.js';
export * from './apps.seed.js';
export * from './roles.seed.js';
export * from './user.seed.js';

/**
 * Seed 總入口，依序執行所有 seed，供 seed.ts 呼叫。
 * 順序不可打亂：
 * 1. App 要先存在
 * 2. Role 才能掛在 App 底下
 * 3. User 才能被授予 Role
 */
export async function seedAuth(prisma: PrismaService) {
  const apps = await seedApps(prisma);
  const roles = await seedRoles(prisma, apps);
  await seedUser(prisma, roles);

  console.log('All seeds completed.');
}

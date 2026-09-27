import { PrismaService } from '../prisma.service.js';

import { seedAuth } from './auth.seed.js';
import { seedFile } from './file.seed.js';
import { seedLauncherApps } from './launcher.seed.js';
import { seedNotification } from './notification.seed.js';


const prisma = new PrismaService();

async function main() {
  console.log('Starting seed...');

  await seedAuth(prisma);
  await seedFile(prisma);
  await seedNotification(prisma);
  // 權限 seed 放在最後：它會用到 auth seed 建立的管理員帳號
  // App 入口所需的 App 資料列（控制台、Canvas）
  await seedLauncherApps(prisma);

  console.log('Seed completed.');
}

main()
  .catch((error) => {
    console.error('Seed failed.');
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaService } from '../prisma.service.js';
import { seedAuth } from './auth/index.js';

/**
 * `prisma db seed` 實際執行的進入點。
 * 只負責建立 / 關閉連線，實際 seed 邏輯都在 seed/index.ts 的 seed() 裡。
 */
async function main() {
  const prisma = new PrismaService();

  try {
    await seedAuth(prisma);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();

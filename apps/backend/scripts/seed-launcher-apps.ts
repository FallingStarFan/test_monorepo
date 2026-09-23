import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/module/public-service/prisma/generated/prisma/client.js";
import { seedLauncherApps } from "../src/module/public-service/prisma/seed/launcher.seed.js";

/**
 * 只補 App 入口所需的 App 資料列（控制台、Canvas）。
 *
 * 為什麼不直接跑完整的 prisma db seed：
 * 完整 seed 會一併建立預設管理員帳號與其他示範資料；
 * 若只想把新的 App 資料列補進共用資料庫，跑完整 seed 會產生非預期的副作用
 * （例如在只有正式資料的環境多出一組示範帳號）。這個腳本只做 upsert App，
 * 可重複執行且不影響其他資料表。
 *
 * 執行方式（於 apps/backend 目錄）：
 *   pnpm tsx scripts/seed-launcher-apps.ts
 */
// 這裡刻意不 import 應用程式的 config/env：那個模組會要求所有環境變數都存在
// （OAuth、R2、SMTP 等），只為了寫兩筆 App 資料而補齊一整套金鑰並不合理。
process.loadEnvFile();

const connectionString = process.env.PUBLIC_SERVICE_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "缺少環境變數 PUBLIC_SERVICE_DATABASE_URL（請確認 apps/backend/.env）",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
  }),
});

async function main() {
  await seedLauncherApps(prisma);

  const apps = await prisma.app.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      name: true,
      description: true,
    },
  });

  console.log("目前 apps 表內容：");

  for (const app of apps) {
    console.log(`- ${app.name}: ${app.description ?? "(無說明)"}`);
  }
}

main()
  .catch((error) => {
    console.error("補 App 資料列失敗");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

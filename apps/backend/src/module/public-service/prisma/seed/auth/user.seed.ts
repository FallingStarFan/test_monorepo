import type { PrismaService } from '../../prisma.service.js';
import type { RoleMap } from './roles.seed.js';
import { ADMIN_APP_NAME, ADMIN_EMAIL, ADMIN_NAME, ADMIN_ROLE_NAME } from './constants.js';

/**
 * 建立預設管理員帳號，並授予他 ADMIN_APP_NAME 底下的 ADMIN_ROLE_NAME 角色。
 * 必須在 seedRoles 之後執行，因為需要吃到已經建立好的 Role id。
 *
 * @param roles 由 seedRoles() 回傳的 Role 對照表
 */
export async function seedUser(
  prisma: PrismaService,
  roles: RoleMap,
) {
  console.log('Seeding User...');

  // 已經有管理員帳號就跳過，讓這個函式可以安全地重複執行
  const existingUser = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingUser) {
    console.log('User seed skipped: admin already exists.');
    return;
  }

  const adminRole = roles[ADMIN_APP_NAME]?.[ADMIN_ROLE_NAME];

  if (!adminRole) {
    // 代表 seedRoles 沒有先跑過，或是 constants.ts 裡的 App / Role 名稱打錯字
    throw new Error(
      `User seed failed: role "${ADMIN_ROLE_NAME}" for app "${ADMIN_APP_NAME}" not found. Did seedRoles run first?`,
    );
  }

  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      status: 'ACTIVE',
      emailVerified: true,
      // 建立一筆 UserRole 中介紀錄，把這個 User 跟上面找到的 ADMIN Role 連接起來
      role: {
        create: {
          role: {
            connect: { id: adminRole.id },
          },
        },
      },
    },
  });

  console.log('User seed completed.');
}

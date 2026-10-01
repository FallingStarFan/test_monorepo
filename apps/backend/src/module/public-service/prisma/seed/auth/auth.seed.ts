import type { PrismaService } from '../../prisma.service.js';
import type { RoleMap } from './roles.seed.js';

// 管理員帳號要掛在哪個 App 的 ADMIN 角色底下。
// 目前預設是 Console（後台管理介面），如果你的管理後台其實是 Canvas，改這一行就好。
const ADMIN_APP_NAME = 'Console';

/**
 * 建立預設管理員帳號，並授予他 ADMIN_APP_NAME（Console）底下的 ADMIN 角色。
 * 必須在 seedRoles 之後執行，因為需要吃到已經建立好的 Role id。
 */
export async function seedAuth(
  prisma: PrismaService,
  roles: RoleMap,
) {
  console.log('Seeding Auth...');

  // 已經有管理員帳號就跳過，讓這個函式可以安全地重複執行
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (existingUser) {
    console.log('Auth seed skipped: admin already exists.');
    return;
  }

  const adminRole = roles[ADMIN_APP_NAME]?.['ADMIN'];

  if (!adminRole) {
    // 代表 seedRoles 沒有先跑過，或是 ADMIN_APP_NAME 打錯字
    throw new Error(
      `Auth seed failed: ADMIN role for app "${ADMIN_APP_NAME}" not found. Did seedRoles run first?`,
    );
  }

  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin',
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

  console.log('Auth seed completed.');
}
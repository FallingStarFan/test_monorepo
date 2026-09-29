import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/module/public-service/prisma.js';
import type { AuthRoleData } from '@test/shared';

@Injectable()
export class AuthRolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 取得使用者在各 App 的角色，供登入與 /auth/me 回傳。
   *
   * 回傳範例：
   * [{ appName: 'xingfan-studio', roleName: ['ADMIN', 'USER'] }]
   */
  async getAuthRoles(userId: string): Promise<AuthRoleData[]> {
    const assignments = await this.prisma.userRole.findMany({
      where: { userId },
      select: {
        role: {
          select: {
            name: true,
            app: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { role: { app: { name: 'asc' } } },
        { role: { name: 'asc' } },
      ],
    });

    // 用 app.id 分組，避免不同 App 恰好同名時被合併。
    const rolesByApp = new Map<string, AuthRoleData>();

    for (const { role } of assignments) {
      const existing = rolesByApp.get(role.app.id);

      if (existing) {
        existing.roleName.push(role.name);
      } else {
        rolesByApp.set(role.app.id, {
          appName: role.app.name,
          roleName: [role.name],
        });
      }
    }

    return [...rolesByApp.values()];
  }
}
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.js';

@Injectable()
export class UserRoleService {
  constructor(private readonly prisma: PrismaService) {}

  async getRolesForApp(userId: string, appId?: string) {
    const assignments = await this.prisma.userRole.findMany({
      where: {
        userId,
        ...(appId ? { role: { appId } } : {}),
      },
      select: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            app: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return assignments.map(({ role }) => role);
  }
}
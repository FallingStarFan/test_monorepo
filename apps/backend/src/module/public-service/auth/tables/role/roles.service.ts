import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService, Prisma } from '@/module/public-service/prisma.js';
import { MESSAGES } from '@/common/response/messages.js';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  // 取得指定 App 的所有 Role
  async findAllByApp(appId: string) {
    return this.prisma.role.findMany({
      where: {
        appId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // 取得指定 App 的單一 Role
  async findById(appId: string, roleId: string) {
    const role = await this.prisma.role.findFirst({
      where: {
        id: roleId,
        appId,
      },
    });

    if (!role) {
      throw new NotFoundException({ message: MESSAGES.ROLE_NOT_FOUND });
    }

    return role;
  }

  // 建立 Role
  async create(appId: string, name: string, description?: string) {
    const app = await this.prisma.app.findUnique({
      where: {
        id: appId,
      },
    });

    if (!app) {
      throw new NotFoundException({ message: MESSAGES.APP_NOT_FOUND });
    }

    const existingRole = await this.prisma.role.findUnique({
      where: {
        appId_name: {
          appId,
          name,
        },
      },
    });

    if (existingRole) {
      throw new ConflictException({ message: MESSAGES.ROLE_ALREADY_EXISTS });
    }

    return this.prisma.role.create({
      data: {
        appId,
        name,
        description,
      },
    });
  }

  // 修改 Role
  async update(
    appId: string,
    roleId: string,
    name?: string,
    description?: string,
  ) {
    await this.findById(appId, roleId);

    if (name) {
      const existingRole = await this.prisma.role.findFirst({
        where: {
          appId,
          name,
          NOT: {
            id: roleId,
          },
        },
      });

      if (existingRole) {
        throw new ConflictException({ message: MESSAGES.ROLE_ALREADY_EXISTS });
      }
    }

    return this.prisma.role.update({
      where: {
        id: roleId,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });
  }

  // 刪除 Role
  async remove(appId: string, roleId: string) {
    await this.findById(appId, roleId);

    return this.prisma.role.delete({
      where: {
        id: roleId,
      },
    });
  }
}

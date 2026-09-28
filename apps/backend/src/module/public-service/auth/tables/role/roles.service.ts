import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService, Prisma } from '@/module/public-service/prisma.js';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

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
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  // 建立 Role
  async create(
    appId: string,
    name: string,
    description?: string,
  ) {
    const app = await this.prisma.app.findUnique({
      where: {
        id: appId,
      },
    });

    if (!app) {
      throw new NotFoundException('App not found');
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
      throw new ConflictException(
        'Role already exists in this App',
      );
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
        throw new ConflictException(
          'Role already exists in this App',
        );
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
// src/user/user.service.ts

import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';





import { Prisma, PrismaService } from '../../../prisma.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';

import { pageArgs, toPage } from '@/common/pagination/paginate.js';




@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fields that are safe to expose.
   *
   * password relation is intentionally excluded.
   */
  private readonly userSelect = {
    id: true,
    email: true,
    emailVerified: true,
    name: true,
    image: true,
    role: {
      include: {
        role: true,
      },
    },
    status: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.UserSelect;

  /**
   * Create User
   */
  async create(dto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email,
          emailVerified: dto.emailVerified ?? false,
          name: dto.name,
          image: dto.image,
          role: dto.roleIds
            ? {
                create: dto.roleIds.map((roleId) => ({
                  role: { connect: { id: roleId } },
                })),
              }
            : undefined,
          status: dto.status,
        },
        select: this.userSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Get all Users
   */
  // async findAll() {
  //   return this.prisma.user.findMany({
  //     select: this.userSelect,
  //     orderBy: {
  //       createdAt: 'desc',
  //     },
  //   });
  // }

  async findAllPageable(
    page: number,
    pageSize: number,
    order: 'asc' | 'desc',
  ) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        ...pageArgs({ page, pageSize }),
        select: this.userSelect,
        orderBy: [{ createdAt: order }, { id: 'asc' }],
      }),
      this.prisma.user.count(),
    ]);

    return toPage(items, total, page, pageSize);
  }

  /**
   * Get User by ID
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get User by Email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: this.userSelect,
    });
  }

  /**
   * Update User
   */
  async update(id: string, dto: UpdateUserDto) {
    await this.ensureUserExists(id);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          email: dto.email,
          emailVerified: dto.emailVerified,
          name: dto.name,
          image: dto.image,
          role: dto.roleIds
            ? {
                deleteMany: {},
                create: dto.roleIds.map((roleId) => ({
                  role: { connect: { id: roleId } },
                })),
              }
            : undefined,
          status: dto.status,
        },
        select: this.userSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Delete User
   */
  async remove(id: string) {
    await this.ensureUserExists(id);

    try {
      await this.prisma.user.delete({
        where: { id },
      });

      return {
        success: true,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Check User exists
   */
  private async ensureUserExists(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Prisma Error Handler
   */
  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Email already exists');
    }

    throw error;
  }
}

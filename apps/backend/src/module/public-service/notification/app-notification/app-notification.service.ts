import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/module/public-service/prisma.js';

@Injectable()
export class AppNotificationService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================
  // Query
  // ============================================================

  /**
   * 取得指定使用者的 App Notification。
   */
  async findByUserId(userId: string) {
    return this.prisma.appNotification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 取得指定 App Notification。
   */
  async findById(id: string) {
    return this.prisma.appNotification.findUnique({
      where: {
        id,
      },
    });
  }

  // ============================================================
  // Create
  // ============================================================

  /**
   * 建立 App Notification。
   */
  async create(data: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    linkPath: string;
    actorUserId?: string;
    actorLabel?: string;
  }) {
    return this.prisma.appNotification.create({
      data,
    });
  }

  // ============================================================
  // Read
  // ============================================================

  /**
   * 將指定 App Notification 標記為已讀。
   */
  async markAsRead(id: string) {
    return this.prisma.appNotification.update({
      where: {
        id,
      },
      data: {
        readAt: new Date(),
      },
    });
  }
}
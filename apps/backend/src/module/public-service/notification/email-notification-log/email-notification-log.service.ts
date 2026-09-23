import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/module/public-service/prisma.js';

@Injectable()
export class EmailNotificationLogService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================
  // Query
  // ============================================================

  /**
   * 取得 Email Notification Log。
   */
  async findAll() {
    return this.prisma.emailNotificationLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 取得指定 Email Notification Log。
   */
  async findById(id: string) {
    return this.prisma.emailNotificationLog.findUnique({
      where: {
        id,
      },
    });
  }

  // ============================================================
  // Create
  // ============================================================

  /**
   * 建立 Email Notification Log。
   *
   * 僅保存 Email 寄送紀錄，
   * 不負責實際 Email 寄送。
   */
  async create(data: {
    actorUserId?: string;
    actorEmail?: string;
    recipient: string;
    template?: string;
    provider: string;
    subject?: string;
    bodyText?: string;
    bodyHtml?: string;
    attachments?: object;
  }) {
    return this.prisma.emailNotificationLog.create({
      data,
    });
  }
}
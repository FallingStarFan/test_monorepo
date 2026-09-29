import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/module/public-service/prisma.js';
import {pageArgs, toPage } from '@/common/pagination/paginate.js';

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
  // async findAll() {
  //   return this.prisma.emailNotificationLog.findMany({
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
        this.prisma.emailNotificationLog.findMany({
          ...pageArgs({ page, pageSize }),
          // select: this.userSelect,
          orderBy: [{ createdAt: order }, { id: 'asc' }],
        }),
        this.prisma.emailNotificationLog.count(),
      ]);
  
      return toPage(items, total, page, pageSize);
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


  async findByIdPageable(
      id: string,
      page: number,
      pageSize: number,
      order: 'asc' | 'desc',
    ) {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.emailNotificationLog.findMany({
          ...pageArgs({ page, pageSize }),
          // select: this.userSelect,
          where: { id },
          orderBy: [{ createdAt: order }, { id: 'asc' }],
        }),
        this.prisma.emailNotificationLog.count(),
      ]);
  
      return toPage(items, total, page, pageSize);
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

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/module/public-service/prisma.js';

@Injectable()
export class StoredFileMetaService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================
  // Query
  // ============================================================

  /**
   * 取得指定 File Metadata。
   */
  async findById(id: string) {
    const file = await this.prisma.storedFileMeta.findUnique({
      where: {
        id,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  /**
   * 依 Object Storage Object Key 取得 File Metadata。
   */
  async findByObjectKey(objectKey: string) {
    const file = await this.prisma.storedFileMeta.findUnique({
      where: {
        objectKey,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  /**
   * 取得指定資源關聯的 File Metadata。
   */
  async findByRelation(
    relationType: string,
    relationId: string,
  ) {
    return this.prisma.storedFileMeta.findMany({
      where: {
        relationType,
        relationId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 取得尚未被軟刪除的 File Metadata。
   */
  async findActive() {
    return this.prisma.storedFileMeta.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ============================================================
  // Create
  // ============================================================

  /**
   * 建立 File Metadata。
   *
   * 僅建立 PostgreSQL Metadata，
   * 不負責實際 Object Storage 上傳。
   */
  async create(data: {
    objectKey: string;
    bucketId?: string;
    originalName?: string;
    mimeType?: string;
    bytes?: bigint;
    etag?: string;
    checksum?: string;
    relationType?: string;
    relationId?: string;
  }) {
    return this.prisma.storedFileMeta.create({
      data,
    });
  }

  // ============================================================
  // Update
  // ============================================================

  /**
   * 更新 File Metadata。
   */
  async update(
    id: string,
    data: {
      originalName?: string;
      mimeType?: string;
      bytes?: bigint;
      etag?: string;
      checksum?: string;
      relationType?: string;
      relationId?: string;
    },
  ) {
    await this.findById(id);

    return this.prisma.storedFileMeta.update({
      where: {
        id,
      },
      data,
    });
  }

  // ============================================================
  // Soft Delete
  // ============================================================

  /**
   * 軟刪除 File Metadata。
   *
   * 不會立即刪除 Object Storage 中的實際檔案。
   * 後續由 purge 流程負責清理。
   */
  async softDelete(id: string) {
    await this.findById(id);

    return this.prisma.storedFileMeta.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

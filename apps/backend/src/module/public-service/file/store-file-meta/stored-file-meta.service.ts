import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  CreateStoredFileMetaRequest,
  UpdateStoredFileMetaRequest,
} from '@test/shared';

import { PrismaService } from '@/module/public-service/prisma.js';

@Injectable()
export class StoredFileMetaService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const file = await this.prisma.storedFileMeta.findUnique({
      where: { id },
    });

    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async findByObjectKey(objectKey: string) {
    const file = await this.prisma.storedFileMeta.findUnique({
      where: { objectKey },
    });

    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  findByRelation(relationType: string, relationId: string) {
    return this.prisma.storedFileMeta.findMany({
      where: {
        relationType,
        relationId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findActive() {
    return this.prisma.storedFileMeta.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: CreateStoredFileMetaRequest) {
    return this.prisma.storedFileMeta.create({
      data: {
        ...data,
        bytes: this.toBigInt(data.bytes),
      },
    });
  }

  async update(id: string, data: UpdateStoredFileMetaRequest) {
    await this.findById(id);

    return this.prisma.storedFileMeta.update({
      where: { id },
      data: {
        ...data,
        bytes: this.toBigInt(data.bytes),
      },
    });
  }

  async softDelete(id: string) {
    await this.findById(id);

    return this.prisma.storedFileMeta.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private toBigInt(value?: number): bigint | undefined {
    if (value === undefined) return undefined;

    if (!Number.isSafeInteger(value) || value < 0) {
      throw new BadRequestException({
        message: {
          en: 'bytes must be a non-negative safe integer',
          zh: 'bytes 必須是非負安全整數',
        },
      });
    }

    return BigInt(value);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';


import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { randomUUID } from 'node:crypto';

import type {
  CreateStoredFileMetaRequest,
  UpdateStoredFileMetaRequest,
} from '@test/shared';


import { StoredFileMetaService } from './store-file-meta/stored-file-meta.service.js';
import {
  FILE_STORAGE,
  type FileStorage,
} from './intergration/file-storage.provider.js';
import { JwtAuthGuard } from '../auth/services/jwt/jwt-auth.guard.js';

@ApiTags('File')
@Controller('file')
export class FileController {
  constructor(
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStorage,
    private readonly storedFileMetaService: StoredFileMetaService,
  ) {}

  // ============================================================
  // R2 Upload
  // ============================================================

  @Post('upload-url')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create R2 upload URL',
    description:
      '建立 Cloudflare R2 Presigned Upload URL。前端取得 URL 後直接將檔案上傳至 R2。需要登入才能取得上傳授權。',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token is missing, invalid, or expired. / 未登入或 Access Token 無效。',
  })
  @ApiBody({
    description: 'File upload information',
    schema: {
      type: 'object',
      required: ['fileName'],
      properties: {
        fileName: {
          type: 'string',
          description: '原始檔名',
          example: 'example.png',
        },
        contentType: {
          type: 'string',
          description: 'File MIME Type',
          example: 'image/png',
        },
        expiresIn: {
          type: 'integer',
          description: 'Presigned URL 有效時間，單位為秒',
          example: 600,
          default: 600,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '成功建立 R2 Presigned Upload URL。',
  })
  async createUploadUrl(
    @Body()
    body: {
      fileName: string;
      contentType?: string;
      expiresIn?: number;
    },
  ) {
    const extension = body.fileName.includes('.')
      ? `.${body.fileName.split('.').pop()}`
      : '';

    const date = new Date();

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');

    const objectKey = `uploads/${year}/${month}/${randomUUID()}${extension}`;

    const url = await this.fileStorage.getUploadUrl(
      objectKey,
      body.contentType,
      body.expiresIn,
    );

    return { url, objectKey };
  }

  // @Post('upload')
  // @ApiOperation({
  //   summary: 'Direct upload to R2',
  //   description: 'multipart/form-data 直接上傳，供 Swagger UI 一鍵測試。',
  // })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       file: { type: 'string', format: 'binary' },
  //     },
  //   },
  // })
  // @UseInterceptors(
  //   FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  // )
  // async uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   const extension = file.originalname.includes('.')
  //     ? `.${file.originalname.split('.').pop()}`
  //     : '';

  //   const date = new Date();
  //   const year = date.getUTCFullYear();
  //   const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  //   const objectKey = `uploads/${year}/${month}/${randomUUID()}${extension}`;

  //   await this.fileStorage.upload(objectKey, file.buffer, file.mimetype);

  //   return { objectKey, size: file.size, mimeType: file.mimetype };
  // }

  // ============================================================
  // R2 Download
  // ============================================================

  @Get('download-url')
  @ApiOperation({
    summary: 'Create R2 download URL',
    description:
      '建立 Cloudflare R2 Presigned Download URL，用於存取 Private Bucket 中的檔案。',
  })
  @ApiQuery({
    name: 'objectKey',
    description: 'R2 Object Key',
    example: 'uploads/2026/09/550e8400-example.png',
  })
  @ApiQuery({
    name: 'expiresIn',
    required: false,
    description: 'Presigned URL 有效時間，單位為秒',
    example: 600,
  })
  @ApiResponse({
    status: 200,
    description: '成功建立 R2 Presigned Download URL。',
  })
  async createDownloadUrl(
    @Query('objectKey') objectKey: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    const url = await this.fileStorage.getDownloadUrl(
      objectKey,
      expiresIn ? Number(expiresIn) : undefined,
    );

    return { url };
  }

  // ============================================================
  // File Metadata Query
  // ============================================================

  @Get('relation')
  @ApiOperation({
    summary: 'Get files by relation',
    description: '取得指定資源所關聯的 File Metadata。',
  })
  @ApiQuery({
    name: 'relationType',
    description: '關聯資源類型',
    example: 'drawer',
  })
  @ApiQuery({
    name: 'relationId',
    description: '關聯資源 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得關聯檔案。',
  })
  findByRelation(
    @Query('relationType') relationType: string,
    @Query('relationId') relationId: string,
  ) {
    return this.storedFileMetaService.findByRelation(relationType, relationId);
  }

  @Get('object/{*objectKey}')
  @ApiOperation({
    summary: 'Get file metadata by object key',
    description: '依 R2 Object Key 取得 File Metadata。',
  })
  @ApiParam({
    name: 'objectKey',
    description: 'R2 Object Key',
    example: 'uploads/2026/09/example.png',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得 File Metadata。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的 File Metadata。',
  })
  findByObjectKey(@Param('objectKey') objectKey: string) {
    return this.storedFileMetaService.findByObjectKey(objectKey);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get file metadata',
    description: '取得指定 File Metadata。',
  })
  @ApiParam({
    name: 'id',
    description: 'File Metadata ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得 File Metadata。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的 File Metadata。',
  })
  findById(@Param('id') id: string) {
    return this.storedFileMetaService.findById(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get active files',
    description: '取得目前尚未軟刪除的 File Metadata。',
  })
  @ApiResponse({
    status: 200,
    description: '成功取得 File Metadata。',
  })
  findActive() {
    return this.storedFileMetaService.findActive();
  }

  // ============================================================
  // File Metadata Create
  // ============================================================

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create file metadata',
    description:
      '建立 File Metadata。此 API 僅建立資料庫 Metadata，不負責實際 R2 上傳。需要登入才能建立。',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token is missing, invalid, or expired. / 未登入或 Access Token 無效。',
  })
  @ApiBody({
    description: 'File Metadata',
    schema: {
      type: 'object',
      required: ['objectKey'],
      properties: {
        objectKey: {
          type: 'string',
          description: 'R2 Object Key',
          example: 'uploads/2026/09/example.png',
        },
        bucketId: {
          type: 'string',
          nullable: true,
          description: 'R2 Bucket ID',
          example: 'private',
        },
        originalName: {
          type: 'string',
          nullable: true,
          description: '使用者上傳時的原始檔名',
          example: 'example.png',
        },
        mimeType: {
          type: 'string',
          nullable: true,
          description: '檔案 MIME Type',
          example: 'image/png',
        },
        bytes: {
          type: 'integer',
          nullable: true,
          format: 'int64',
          description: '檔案大小，單位為 bytes',
          example: 182034,
        },
        etag: {
          type: 'string',
          nullable: true,
          description: 'R2 Object ETag',
          example: '"d41d8cd98f00b204e9800998ecf8427e"',
        },
        checksum: {
          type: 'string',
          nullable: true,
          description: '檔案內容 Checksum',
          example: 'sha256:abc123...',
        },
        relationType: {
          type: 'string',
          nullable: true,
          description: '關聯資源類型',
          example: 'drawer',
        },
        relationId: {
          type: 'string',
          nullable: true,
          description: '關聯資源 ID',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '成功建立 File Metadata。',
  })
  create(@Body() body: CreateStoredFileMetaRequest) {
    return this.storedFileMetaService.create(body);
  }

  // ============================================================
  // File Metadata Update
  // ============================================================

  @Patch(':id')
  @ApiOperation({
    summary: 'Update file metadata',
    description: '更新指定 File Metadata。',
  })
  @ApiParam({
    name: 'id',
    description: 'File Metadata ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: '成功更新 File Metadata。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的 File Metadata。',
  })
  update(@Param('id') id: string, @Body() body: UpdateStoredFileMetaRequest) {
    return this.storedFileMetaService.update(id, body);
  }

  // ============================================================
  // File Metadata Soft Delete
  // ============================================================

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete file',
    description:
      '軟刪除 File Metadata。R2 實際檔案不會立即刪除，後續由 purge 流程清理。',
  })
  @ApiParam({
    name: 'id',
    description: 'File Metadata ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: '成功軟刪除 File Metadata。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的 File Metadata。',
  })
  softDelete(@Param('id') id: string) {
    return this.storedFileMetaService.softDelete(id);
  }
}

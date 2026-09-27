export interface StoredFileMeta {
  id: string;
  objectKey: string;
  bucketId: string | null;
  originalName: string | null;
  mimeType: string | null;
  /** Prisma BigInt is serialized by the API as a decimal string. */
  bytes: string | null;
  etag: string | null;
  checksum: string | null;
  relationType: string | null;
  relationId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateStoredFileMetaRequest {
  objectKey: string;
  bucketId?: string;
  originalName?: string;
  mimeType?: string;
  bytes?: number;
  etag?: string;
  checksum?: string;
  relationType?: string;
  relationId?: string;
}

export interface UpdateStoredFileMetaRequest {
  originalName?: string;
  mimeType?: string;
  bytes?: number;
  etag?: string;
  checksum?: string;
  relationType?: string;
  relationId?: string;
}

export interface CreateUploadUrlRequest {
  fileName: string;
  contentType?: string;
  expiresIn?: number;
}

export interface CreateUploadUrlResponse {
  url: string;
  objectKey: string;
}

export interface CreateDownloadUrlResponse {
  url: string;
}

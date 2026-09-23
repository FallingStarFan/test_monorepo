/**
 * 檔案模組相關型別。
 *
 * 對應 apps/backend 的 file 模組（FileController / StoredFileMeta）與 file.prisma，
 * 前端上傳、下載、查詢檔案時都沿用同一組欄位定義。
 */

/**
 * Object Storage 檔案 Metadata。
 *
 * bytes 在資料庫是 BigInt，經 JSON 傳輸後可能變成字串或數字，
 * 因此型別同時允許兩者，避免前端因為格式差異而顯示錯誤的檔案大小。
 */
export interface StoredFileMeta {
  id: string;
  objectKey: string;
  bucketId: string | null;
  originalName: string | null;
  mimeType: string | null;
  bytes: number | string | null;
  etag: string | null;
  checksum: string | null;
  relationType: string | null;
  relationId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** 建立檔案 Metadata 的請求內容（僅寫入資料庫，實際上傳走 presigned URL）。 */
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

/** 更新檔案 Metadata 的請求內容。 */
export interface UpdateStoredFileMetaRequest {
  originalName?: string;
  mimeType?: string;
  bytes?: number;
  etag?: string;
  checksum?: string;
  relationType?: string;
  relationId?: string;
}

/**
 * 取得 presigned 上傳網址的請求內容。
 *
 * expiresIn 由前端指定時必須落在後端允許範圍內，
 * 否則網址可能在檔案還在上傳時就失效。
 */
export interface CreateUploadUrlRequest {
  fileName: string;
  contentType?: string;
  expiresIn?: number;
}

/** presigned 上傳網址的回應內容。 */
export interface CreateUploadUrlResponse {
  url: string;
  objectKey: string;
}

/** presigned 下載網址的回應內容。 */
export interface CreateDownloadUrlResponse {
  url: string;
}

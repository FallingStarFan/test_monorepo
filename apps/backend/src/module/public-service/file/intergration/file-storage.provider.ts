export const FILE_STORAGE = Symbol('FILE_STORAGE');

export interface FileStorage {
  upload(
    objectKey: string,
    body: Buffer,
    contentType?: string,
  ): Promise<void>;

  delete(objectKey: string): Promise<void>;

  getUploadUrl(
    objectKey: string,
    contentType?: string,
    expiresIn?: number,
  ): Promise<string>;

  getDownloadUrl(
    objectKey: string,
    expiresIn?: number,
  ): Promise<string>;
}
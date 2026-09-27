import type {
  ApiResponse,
  CreateStoredFileMetaRequest,
  CreateUploadUrlRequest,
  CreateUploadUrlResponse,
  StoredFileMeta,
} from "@test/shared";

import { api, unwrapApiData } from "../client";

export async function createUploadUrl(
  request: CreateUploadUrlRequest,
): Promise<CreateUploadUrlResponse> {
  const response = await api.post<ApiResponse<CreateUploadUrlResponse>>(
    "/file/upload-url",
    request,
  );
  return unwrapApiData(response.data);
}

export async function createStoredFileMeta(
  request: CreateStoredFileMetaRequest,
): Promise<StoredFileMeta> {
  const response = await api.post<ApiResponse<StoredFileMeta>>(
    "/file",
    request,
  );
  return unwrapApiData(response.data);
}

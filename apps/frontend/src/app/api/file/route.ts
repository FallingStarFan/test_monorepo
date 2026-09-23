import { NextResponse } from 'next/server';

import { FILE_METADATA_API_PATH } from '@test/shared';

import { forwardBackendApi } from '@/lib/bff';

/**
 * 建立檔案 metadata 的 BFF 代理（Next.js Route Handler）。
 *
 * 上傳流程的第三步：檔案本體直接 PUT 到 R2 後，再把 objectKey 等資訊寫進資料庫。
 * 後端 `POST /api/file` 已加上登入驗證，未登入回 401，
 * 避免未登入者對檔案清單寫入任何紀錄。
 */
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = (await request
    .json()
    .catch(() => null)) as unknown;

  if (body === null) {
    return NextResponse.json(
      {
        statusCode: 400,
        message: {
          en: 'Invalid JSON body',
          zh: '請求內容格式錯誤',
        },
        data: null,
      },
      { status: 400 },
    );
  }

  return forwardBackendApi(FILE_METADATA_API_PATH, {
    method: 'POST',
    body,
  });
}

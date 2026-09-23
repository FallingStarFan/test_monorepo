import { NextResponse } from 'next/server';

import { FILE_UPLOAD_URL_API_PATH } from '@test/shared';

import { forwardBackendApi } from '@/lib/bff';

/**
 * 取得上傳授權網址的 BFF 代理（Next.js Route Handler）。
 *
 * 對應後端 `POST /api/file/upload-url`：後端已加上登入驗證，
 * 未登入回 401，前端據此決定是否顯示上傳介面。
 * 回應內容為 { url, objectKey }，由前端直接對 R2 發送 PUT（不經過後端）。
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

  return forwardBackendApi(FILE_UPLOAD_URL_API_PATH, {
    method: 'POST',
    body,
  });
}

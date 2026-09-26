import { NextResponse } from 'next/server';

import { getServerSession } from '@/lib/server-session';

/**
 * 將 HttpOnly JWT 驗證結果轉成瀏覽器可安全使用的登入狀態。
 * Token 本身不會離開伺服器；前端只會取得使用者與權限摘要。
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json(
      { message: 'Authentication service is unavailable' },
      { status: 503 },
    );
  }

  return NextResponse.json(session, {
    headers: {
      'cache-control': 'no-store',
    },
  });
}

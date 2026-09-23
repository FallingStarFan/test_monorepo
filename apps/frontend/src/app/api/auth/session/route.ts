import { NextResponse } from 'next/server';

import { gatewayErrorResponse } from '@/lib/bff';
import { getServerSession } from '@/lib/server-session';
import type { SessionResponse } from '@/lib/session';

/**
 * 登入狀態的 BFF 代理（Next.js Route Handler）。
 *
 * 為什麼要另開一個端點而不是讓前端各處自行呼叫 `/api/auth/me` 與 `/api/permissions/me`：
 * 導覽列與頁首都需要「是否登入、是否為 ADMIN」這同一份資訊，
 * 若每個元件各自打兩支 API，畫面會出現先後不一致的狀態。
 * 這裡一次問完後端、組成單一結果。
 *
 * 邏輯與 layout 首次渲染共用同一支 getServerSession，
 * 避免「伺服器輸出」與「瀏覽器重新取得」兩套結果不一致。
 *
 * 注意：這裡的 isAdmin 只用於決定「要不要顯示入口」，
 * 真正的資料存取權仍由後端 Guard 決定，前端顯示條件不會成為授權依據。
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession();

  // 後端連不上才回 502；未登入是正常狀態，以 200 回傳 authenticated: false，
  // 前端不必把 401 當例外處理。
  if (!session) {
    return gatewayErrorResponse();
  }

  return NextResponse.json<SessionResponse>(session);
}

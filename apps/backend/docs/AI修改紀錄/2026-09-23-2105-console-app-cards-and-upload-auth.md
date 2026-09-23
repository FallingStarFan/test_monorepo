# 控制台改為 App 卡片並限制 ADMIN、檔案上傳需登入

- 日期：2026-09-23 21:05（Asia/Taipei）
- 任務：在 `test_monorepo` 完成三項調整——控制台改為「有哪些 App」的卡片列表且資料來自後端、控制台僅 `public-service` 的 `ADMIN` 可見（含導覽隱藏）、檔案上傳改為登入後才可使用；並補上 API 測試文件、AI 修改紀錄與 git 紀錄。

## 修改

- `apps/frontend/src/app/page.tsx`：由原本寫死 `MODULE_MAP` 的靜態頁改為伺服器元件。先向 BFF 取登入狀態，未登入顯示「請先登入」、已登入但非 ADMIN 顯示「需要 ADMIN 權限」，兩者都不顯示任何 App 資料；只有 ADMIN 才向 `GET /api/admin/apps` 取清單並以卡片呈現，一個 App 一張卡片。寫死的模組對照表已移除，資料來源單一化為後端。
- `apps/frontend/src/app/login/page.tsx`、`src/app/api/auth/login/route.ts`、`src/app/api/auth/logout/route.ts`、`src/app/api/auth/session/route.ts`：新增最小登入頁與登出入口。原本前端沒有登入頁，授權無從驗證；登入後 cookie 由 Route Handler 保存（HttpOnly），前端只讀得到「登入狀態摘要」。
- `apps/frontend/src/app/api/admin/apps/route.ts`、`src/app/api/file/route.ts`、`src/app/api/file/upload-url/route.ts`、`src/app/api/permissions/me/route.ts`：新增 BFF 路由，伺服器端讀 cookie 轉發後端。前端一律走 BFF，瀏覽器不跨域呼叫後端，因此不需調整後端 `WEB_ORIGIN` / CORS。
- `apps/frontend/src/lib/server-session.ts`、`src/components/providers/session-provider.tsx`：伺服器端載入登入狀態（`authenticated` / `roleNames` / `permissionCodes` / `isAdmin`），向下提供給版面與頁面；Provider 僅負責傳遞，不做判斷。
- `apps/frontend/src/app/layout.tsx`：掛上 `SessionProvider`，讓導覽與頁首能在伺服器端就拿到登入狀態（避免先渲染再補資料的空窗）。
- `apps/frontend/src/components/layout/sidebar-nav.tsx`、`src/components/layout/header.tsx`：非 ADMIN（含未登入）不顯示左側導覽的「控制台」；頁首提供登入 / 登出狀態入口。
- `apps/frontend/src/app/files/page.tsx`、`src/components/files/file-upload-panel.tsx`：未登入時不顯示上傳面板，改顯示需登入提示；已登入者維持既有 presigned 上傳流程。
- `packages/shared/**`：補上 App、登入狀態回應與 BFF 路徑常數，讓前後端共用同一份定義。
- `apps/backend/src/module/public-service/file/file.controller.ts`：`POST /api/file/upload-url` 與 `POST /api/file` 加上 `@UseGuards(AuthenticatedGuard)`，並補上 401 的 Swagger 說明。授權沿用既有 Guard，未新增權限碼、未動 seed；其餘 file 端點維持原狀。

## 影響

- API：後端僅兩個既有端點加上登入驗證；`GET /api/admin/apps` 等既有端點未變更。前端新增 BFF 路由與登入頁。
- Database：無 schema 變更、無 migration。
- 設定：無新增環境變數；後端 `WEB_ORIGIN` / CORS 未調整。
- 相容性：`POST /api/file/upload-url`、`POST /api/file` 由公開改為需登入，屬刻意的行為收斂。

## 驗證

- `pnpm run build`（apps/backend）：PASS
- `pnpm exec tsc --noEmit`（apps/frontend）：PASS
- `pnpm -w run lint`：PASS（0 errors、10 warnings，皆為既有檔案；前端 package 無 lint script）
- 情境一（未登入）：`/` 顯示「請先登入」、無 App 資料；導覽無「控制台」；`/files` 無上傳面板；後端 `POST /api/file/upload-url` 回 401
- 情境二（已登入非 ADMIN）：`/` 顯示「需要 ADMIN 權限」、無 App 資料；導覽無「控制台」；`GET /api/admin/apps` 回 403 `NO_APP_ROLE`；`/files` 可上傳（上傳僅需登入）
- 情境三（已登入 ADMIN）：`/` 以卡片列出 `public-service`；導覽顯示「控制台」；`GET /api/admin/apps` 回 200；BFF `/api/dashboard/overview` 回 200
- 上傳流程：後端與 BFF 的 upload-url 皆回 201 並取得 R2 presigned URL（未實際上傳物件）
- 資料清理：臨時帳號與測試 metadata 皆已刪除，驗證前後 `users` 皆為 0 筆；未更動 seed 與既有資料
- `POST /api/file` 帶 `bytes`：FAIL（500，既有 BigInt 序列化問題，資料已寫入），已記錄於 `docs/已知錯誤/2026-09-23-bigint-serialization-file-metadata.md`

## 待處理

- 正式 vitest e2e 尚未涵蓋本次變更（以臨時腳本驗證），建議後續補 `test/file-upload-file-auth` 類測試。
- 專案尚無任何 commit，文件中的 Commit 訊息為擬定內容。

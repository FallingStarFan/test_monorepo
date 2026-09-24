# 控制台改為 App 卡片並限制 ADMIN、檔案上傳需登入

## Commit 資訊

- **Commit:** `feat(frontend,public-service): 控制台改為 App 卡片並限制 ADMIN、檔案上傳需登入`
- **日期:** 2026-09-23
- **作者:** AI 助手（Marvis File Agent）
- **相關 Issue / PR:** N/A

## 變更目的

前一版控制台把「後端模組 ↔ 前端頁面」的對照表寫死在前端，後端新增 App 之後
畫面不會跟著更新；而且它對所有訪客開放。同時 `/files` 的上傳流程雖然後端已有
presigned 機制，卻沒有登入閘門，任何人都能取得上傳授權。

本次讓控制台改答「目前有哪些 App」並直接向後端取資料，把控制台的可見性收斂到
`public-service` 的 `ADMIN`，並讓檔案上傳必須先登入。

## 變更內容

- [x] 修改：`apps/frontend/src/app/page.tsx` — 改為伺服器元件，透過 BFF 取得登入狀態與
  App 清單（`GET /api/admin/apps`），一個 App 一張卡片；移除寫死的 `MODULE_MAP`。
- [x] 新增：`apps/frontend/src/app/login/page.tsx` 與 BFF `app/api/auth/login`、
  `app/api/auth/logout`、`app/api/auth/session` — 最小登入流程，cookie 由 Route Handler
  以 HttpOnly 形式保存。
- [x] 新增：BFF `app/api/admin/apps`、`app/api/file`、`app/api/file/upload-url`、
  `app/api/permissions/me` — 前端一律經 BFF 讀 cookie 轉發後端，瀏覽器不跨域呼叫後端。
- [x] 新增：`apps/frontend/src/lib/server-session.ts`、
  `src/components/providers/session-provider.tsx` — 伺服器端載入登入狀態並提供給版面使用。
- [x] 修改：`src/app/layout.tsx`、`src/components/layout/sidebar-nav.tsx`、
  `src/components/layout/header.tsx` — 非 ADMIN 隱藏左側導覽的「控制台」，並提供登出入口。
- [x] 修改：`src/app/files/page.tsx`、`src/components/files/file-upload-panel.tsx` —
  未登入不顯示上傳面板，改顯示需登入提示。
- [x] 修改：`packages/shared` — 補上 App、登入狀態與路徑常數，前後端共用。
- [x] 修改：`apps/backend/src/module/public-service/file/file.controller.ts` —
  `POST /api/file/upload-url` 與 `POST /api/file` 加上 `@UseGuards(AuthenticatedGuard)`
  與 401 的 Swagger 說明。
- [x] 新增文件：API 測試文件、AI 修改紀錄、已知錯誤各一份。
- [ ] 移除：無。

## 影響範圍

- **API / 功能:** 前端新增 BFF 路由與登入頁；控制台資料來源改為後端 API。
  後端僅為兩個既有端點加上登入驗證，回應格式與其他端點未變。
- **資料庫 / 設定:** 無 schema 變更、無 migration、無新增環境變數；
  `WEB_ORIGIN` / CORS 設定未調整。
- **相容性:** `POST /api/file/upload-url` 與 `POST /api/file` 由「任何人可用」改為「需登入」，
  屬刻意的行為收斂；其餘端點無破壞性變更。

## 驗證方式

```text
執行的指令：
- pnpm run build（apps/backend）
- pnpm exec tsc --noEmit（apps/frontend）
- pnpm -w run lint
- 臨時 E2E 腳本（tsx）：未登入 / 已登入非 ADMIN / 已登入 ADMIN 三情境，以及上傳流程

驗證結果：

- backend build：PASS
- frontend typecheck：PASS
- lint：PASS（0 errors、10 warnings，警告皆為既有檔案）
- 未登入：`/` 顯示「請先登入」且無任何 App 資料、導覽無「控制台」、
  `/files` 無上傳面板、後端 upload-url 回 401
- 已登入非 ADMIN：`/` 顯示「需要 ADMIN 權限」、導覽無「控制台」、
  `/api/admin/apps` 回 403 `NO_APP_ROLE`、`/files` 可上傳（僅需登入）
- 已登入 ADMIN：`/` 以卡片列出 `public-service`、導覽顯示「控制台」、
  `/api/admin/apps` 回 200、BFF `/api/dashboard/overview` 回 200
- 上傳：後端與 BFF 的 upload-url 皆回 201 並取得 R2 presigned URL
- 測試帳號與測試 metadata：驗證後刪除，未更動 seed 與既有資料
```

## 其他注意事項

- 控制台的資料與授權判斷都在伺服器端（Next.js Server Component 帶 cookie 呼叫 BFF），
  瀏覽器不會取得 token；因此不需要放寬後端 CORS。
- ADMIN 路徑驗證以既有註冊 API 建立臨時帳號並指派既有的 `public-service` `ADMIN` 角色，
  未修改 seed；驗證後帳號已刪除。
- `POST /api/file` 帶 `bytes` 時回 500 為既有問題（BigInt 序列化），已記錄於
  `docs/已知錯誤/2026-09-23-bigint-serialization-file-metadata.md`，本次未修正。
- 專案目前尚無任何 commit，本紀錄的 Commit 訊息為擬定內容，待首次提交時一併納入。
- `apps/backend` 為 `test_backend` 的副本，原始專案未變動。

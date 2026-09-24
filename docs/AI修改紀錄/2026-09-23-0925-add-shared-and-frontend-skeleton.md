# 建立 monorepo 共用套件與 Next.js 前端骨架

- 日期：2026-09-23 09:25（Asia/Taipei）
- 任務：完成 test_monorepo 第一批基礎建設——monorepo 收尾與依賴安裝、建立 `packages/shared`、建立 `apps/frontend`（Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui，含響應式版面骨架與全域 UI 縮放控制）。

## 修改

- `packages/shared/**`：新增 `@test/shared` 套件，定義前後端共用的 API 路由前綴、錯誤碼（`NO_APP_ROLE` / `PERMISSION_DENIED`）、狀態碼與 `StoredFileMeta`、`AppNotification` 等型別。集中定義是為了讓兩端欄位定義不會各自漂移。
- `apps/frontend/**`：新增 Next.js 前端骨架。含版面（固定側欄 + 行動版滑出面板）、頁首、主題切換、全域 UI 縮放（調整根字級而非 CSS transform，以免破壞固定定位與文字清晰度）、shadcn/ui 基礎元件，以及 `/`、`/files`、`/notifications`、`/settings` 四個頁面。
- `README.md`（repo 根）：新增 monorepo 結構、指令與開發約定說明。
- `apps/backend/docs/資料夾結構.md`：補充本專案在 monorepo 中的位置，避免與原始 `test_backend` 目錄混淆。
- `apps/backend/docs/文件索引.md`：於索引加入 monorepo 根說明連結。
- `apps/backend/src/**`：未修改（`apps/backend` 為 `test_backend` 的副本，原始專案亦保持不動）。

## 影響

- API：無變更，後端路由表與回應格式未調整。
- Database：無。
- 設定：新增 `apps/frontend/.env.example`（`NEXT_PUBLIC_API_BASE_URL`，預設指向 `http://localhost:3013`）；依賴統一由 repo 根的 `pnpm-lock.yaml` 管理。
- 相容性：無破壞性變更。

## 驗證

- `pnpm install`（repo 根）：PASS。
- `pnpm -r build`：PASS（`packages/shared`、`apps/backend`、`apps/frontend` 皆建置成功）。
- `pnpm --filter @test/frontend typecheck`：PASS。
- 前端啟動驗證（`next start -p 3100`）：PASS，`/`、`/files`、`/notifications`、`/settings` 皆回應 200，未知路徑回應 404。
- 後端啟動驗證（`node dist/main.js`）：PASS，Nest 成功啟動並監聽 3013，auth / file / notification 路由皆完成註冊。
- vitest + supertest、Playwright：NOT TESTED（尚未建立測試，規劃於後續批次）。

# 建立 monorepo 共用套件與 Next.js 前端骨架

## Commit 資訊

- **Commit:** `feat(monorepo): 建立 shared 套件與 Next.js 前端骨架`
- **日期:** 2026-09-23
- **作者:** AI 助手（Marvis File Agent）
- **相關 Issue / PR:** N/A

## 變更目的

`test_monorepo` 已由 `test_backend` 複製改造為 pnpm workspace，但缺少共用型別來源與前端。
本次完成第一批基礎建設，讓 monorepo 具備可建置、可啟動的最小完整形態，
後續的 permission、billing 與 canvas 模組才有共同的型別與版面基礎可依附。

## 變更內容

- [x] 新增：`packages/shared`（`@test/shared`）— API 常數、授權錯誤碼、檔案與通知型別。
- [x] 新增：`apps/frontend` — Next.js App Router 前端骨架、shadcn/ui 基礎元件、
  響應式版面、全域 UI 縮放與主題切換。
- [x] 新增：repo 根 `README.md`。
- [x] 修改：`apps/backend/docs/資料夾結構.md`、`apps/backend/docs/文件索引.md`
  （補充 monorepo 位置說明與索引連結）。
- [ ] 修正：無。
- [ ] 移除：無。

## 影響範圍

- **API / 功能:** 無變更。後端程式碼未修改，前端頁面目前為版面骨架（示意資料）。
- **資料庫 / 設定:** 無資料庫變更；新增 `apps/frontend/.env.example`。
- **相容性:** 無破壞性變更。

## 驗證方式

```text
執行的指令：
- pnpm install
- pnpm -r build
- pnpm --filter @test/frontend typecheck
- node dist/main.js（apps/backend）
- next start -p 3100（apps/frontend）
```

驗證結果：

- `pnpm install`：PASS
- `pnpm -r build`：PASS
- `pnpm --filter @test/frontend typecheck`：PASS
- 後端啟動：PASS（成功監聽 3013，路由註冊完整）
- 前端啟動：PASS（四個頁面均回 200，未知路徑回 404）

## 其他注意事項

- `apps/backend` 為 `test_backend` 的副本，本次未修改其程式碼，原始專案亦未更動。
- 修改 `packages/shared` 後需先 `pnpm --filter @test/shared build`，前端才會取到最新的型別與常數。
- 依需求規範，前端不建立 drawer 相關元件。
- 後續工作：public-service 的 permission 與 billing 模組、`apps/canvas` 白板、
  vitest + supertest 與 Playwright 測試。

# Git Commit 紀錄

## Commit 資訊

- **Commit:** `feat(auth): add auth modules and relocate Prisma setup`
- **日期:** 2026-09-16
- **作者:** Git 使用者
- **相關 Issue / PR:** `N/A`

## 變更目的

建立 Auth/Users 基礎功能與共用回應處理，並將 Prisma schema、migration 與 NestJS database module 統一到 `src/` 結構，讓 production build 能解析 TypeScript path alias。

## 變更內容

- [x] 新增：Auth、OAuth、password、session、Users 與共用 response 模組
- [x] 新增：Prisma NestJS module、service、schema 與 migration 結構
- [x] 修改：Prisma config、環境設定、NestJS 啟動流程與 TypeScript alias
- [x] 修改：production build 使用 `tsc-alias`，補充相關依賴
- [x] 移除：舊版根目錄 `prisma/` schema 與 migration 檔案

## 影響範圍

- **API / 功能:** 新增 Auth/Users API 基礎結構與全域 HTTP exception filter。
- **資料庫 / 設定:** Prisma schema 與 migration 路徑改為 `src/prisma`，production build 會進行 alias 解析。
- **相容性:** 有路徑結構變更；需使用新的 Prisma schema/migration 路徑。

## 驗證方式

```text
執行的指令：
- pnpm prisma validate
- pnpm test
- pnpm run lint
- pnpm run build
```

驗證結果：
- `pnpm prisma validate`：成功通過，schema 來源為 `src/prisma/db`
- `pnpm test`：1 個測試檔、1 個測試通過
- `pnpm run lint`：成功完成，僅有 unused/generated type 警告
- `pnpm run build`：成功完成，Nest build 與 `tsc-alias` 均通過

## 其他注意事項

`.env` 與本機資料庫設定未納入版本控制。Lint 若只產生既有空檔案警告，不視為驗證失敗。

# Git Commit 紀錄

## Commit 資訊

- **Commit:** `feat(prisma): initialize Prisma project setup`
- **日期:** 2026-09-16
- **作者:** Git 使用者
- **相關 Issue / PR:** `N/A`

## 變更目的

建立 NestJS 後端的 Prisma 基礎設定，補齊資料庫 schema、環境設定與初始遷移，讓專案能夠正常連線 PostgreSQL 並作為後續 Auth 模組開發基底。

## 變更內容

- [x] 新增：Prisma `datasource`、`auth` schema 檔案與初始 migration
- [x] 新增：`prisma.config.ts` 與 `src/config/env.ts`，整合 Prisma 與環境變數設定
- [x] 新增：Auth / Users 模組基礎結構與 DTO
- [x] 修改：專案文件與紀錄資料夾，補充 Prisma 使用說明與提交規範
- [x] 修正：移除舊版 Prisma schema 路徑，調整為新版結構

## 影響範圍

- **API / 功能:** 建立基礎 Auth/Users 模組骨架，支援後續 API 開發。
- **資料庫 / 設定:** 使用 Prisma 7 與 PostgreSQL 連線設定，加入初始資料庫遷移。
- **相容性:** 無破壞性變更，僅新增專案基礎設定。

## 驗證方式

```text
執行的指令：
- pnpm prisma validate
- pnpm prisma generate
- pnpm test
- pnpm run lint
- pnpm run build
```

驗證結果：
- `pnpm prisma validate`：成功通過 schema 驗證
- `pnpm prisma generate`：成功產生 Prisma Client
- `pnpm test`：測試通過
- `pnpm run lint`：Lint 通過
- `pnpm run build`：Build 成功

## 其他注意事項

本次提交包含 Prisma 專案初始化與基礎資料庫遷移；`.env` 及本機資料庫設定未納入版本控制。 

# Git Commit 紀錄

## Commit 資訊

- **Commit:** `chore(prisma): configure Prisma 7 and add database test`
- **日期:** 2026-09-14
- **作者:** Git 使用者
- **相關 Issue / PR:** `N/A`

## 變更目的

統一 Prisma CLI 與 Client 版本，完成 PostgreSQL adapter 設定，並提供可重複執行的資料庫連線測試腳本。

## 變更內容

- [x] 新增：Prisma `User` schema 與連線測試腳本
- [x] 新增：Prisma 7 使用文檔與代理技能文件
- [x] 修改：`package.json` 與 `pnpm-lock.yaml`，加入 Prisma 7、`pg`、adapter 與測試工具
- [x] 修改：忽略 Prisma 產生的 `generated/` 檔案
- [x] 修改：清理 Swagger 設定檔格式

## 影響範圍

- **API / 功能:** 新增 Prisma 資料存取基礎設定，Swagger 行為不變。
- **資料庫 / 設定:** 使用 `.env` 的 `DATABASE_URL` 連線至本機 PostgreSQL。
- **相容性:** 無破壞性變更。

## 驗證方式

```text
pnpm prisma --version
pnpm prisma validate
pnpm prisma generate
pnpm tsx scripts/prisma-test-connect.ts
pnpm test
pnpm run lint
pnpm run build
```

驗證結果：Prisma CLI/Client 均為 7.10.0，schema 驗證通過、Client 產生成功，資料庫連線顯示 `Database connection OK`；單元測試 1 項通過，Lint 與 Build 通過。

## 其他注意事項

`generated/` 是可由 `pnpm prisma generate` 重建的產生物，不納入 Git；`.env` 不納入 Git。
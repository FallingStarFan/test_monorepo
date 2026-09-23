# Git Commit 紀錄

## Commit 資訊

- **Commit:** `feat(database): complete public service multi-module database`
- **日期:** 2026-09-17
- **作者:** Git 使用者
- **相關 Issue / PR:** `N/A`

## 變更目的

完成 public-service 的多模組資料庫基礎，將 Prisma 與 Auth 功能整合到同一個服務模組，並建立可驗證、可產生 Client、可執行 migration 的專用設定。

## 變更內容

- [x] 新增：Auth、File、Notification 多模組 Prisma schema
- [x] 新增：public-service Prisma config、module、service、generated Client 與初始 migration
- [x] 新增：Users、OAuth、Passwords、Sessions 與 OAuth strategies 模組
- [x] 修改：NestJS AppModule、環境設定、啟動流程與依賴套件
- [x] 修改：新增 `public-service:validate`、`public-service:generate`、`public-service:migrate` scripts
- [x] 移除：舊版分散的 Prisma/Auth 結構與舊資料庫設定

## 影響範圍

- **API / 功能:** public-service Auth 多模組基礎與 OAuth、密碼、session、Users API 結構。
- **資料庫 / 設定:** 使用 `src/module/public-service/prisma` 管理 schema、generated Client 與 migration，資料庫連線使用 `PUBLIC_SERVICE_DATABASE_URL`。
- **相容性:** Prisma schema 與 module 路徑改為 public-service 專用結構。

## 驗證方式

```text
執行的指令：
- pnpm run public-service:validate
- pnpm run public-service:migrate
- pnpm test
- pnpm run lint
- pnpm run build
```

驗證結果：
- `pnpm run public-service:validate`：成功通過，三組 public-service schema 載入成功
- `pnpm run public-service:migrate`：成功完成初始 migration
- `pnpm test`：1 個測試檔、1 個測試通過
- `pnpm run lint`：成功完成，僅有未使用 `request` 警告
- `pnpm run build`：成功完成，Nest build 與 `tsc-alias` 均通過

## 其他注意事項

`.env` 與本機資料庫設定未納入版本控制。Generated Prisma Client 隨本次結構變更同步更新。

# 修正 build 並建立 AI 修改紀錄規範

- 日期：2026-09-22 13:20（Asia/Taipei）
- 任務：修正目前 build 錯誤，並建立每次 AI 修改的持續紀錄規範。

## 修改

- `src/config/env.ts`：改用 Node 原生 `.env` 載入，解決 dotenv 型別解析失敗。
- `src/module/public-service/auth/users/`：依現行 Prisma User–Role 關聯改用 `roleIds`。
- `src/module/public-service/prisma.ts`、`prisma/seed/auth.seed.ts`：對齊關聯模型與 seed。
- `docs/`：更新文件索引、角色模型、API 測試紀錄與 AI 修改紀錄規範。

## 影響

- API：`POST/PATCH /users` 使用選填 `roleIds: UUID[]` 指派角色；更新時傳入陣列會完整取代既有角色。
- Database：無 schema 或 migration 修改。
- 設定：執行環境需支援 Node.js `process.loadEnvFile()`（目前專案使用 Node 22）。

## 驗證

- `pnpm.cmd run build`：PASS。
- `pnpm.cmd test`：PASS（2 個測試檔、3 個測試）。
- `pnpm.cmd run lint`：PASS，保留既有 warning。
- HTTP API 與資料庫關聯測試：NOT TESTED（未啟動資料庫與 API 環境）。

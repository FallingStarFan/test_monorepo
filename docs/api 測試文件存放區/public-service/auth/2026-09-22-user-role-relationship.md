# User Role Relationship API 測試文件

## 測試資訊

- **Module:** `public-service/auth/users`
- **日期:** 2026-09-22
- **變更:** User 的舊 enum role 欄位改為 App/Role 關聯的 `roleIds`

## 受影響 API

| Method | Path | 變更 |
|---|---|---|
| `POST` | `/users` | 請求欄位改為選填 `roleIds: UUID[]` |
| `PATCH` | `/users/:id` | 傳入 `roleIds` 時完整取代既有角色 |
| `GET` | `/users`、`/users/:id` | 回傳 UserRole 與其關聯 Role |

## 驗證結果

| 項目 | 結果 | 說明 |
|---|---|---|
| TypeScript build | PASS | `pnpm.cmd run build` |
| 自動化測試 | PASS | `pnpm.cmd test`；2 個測試檔、3 個測試 |
| Request validation | NOT TESTED | 未啟動資料庫與 HTTP API 環境 |
| Database relation | NOT TESTED | 未執行實際資料庫測試 |
| Swagger UI | NOT TESTED | 未啟動應用程式驗證 |

## 備註

`roleIds` 未傳入時，更新不變更既有角色；傳入空陣列時，會移除該使用者全部角色。

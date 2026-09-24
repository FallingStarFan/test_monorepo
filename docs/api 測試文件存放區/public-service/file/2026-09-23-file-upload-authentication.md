# 檔案上傳端點登入驗證 API 測試文件

## 測試資訊

- **Module:** `public-service/file`
- **日期:** 2026-09-23
- **變更 Commit:** `feat(public-service): 檔案上傳端點加上登入驗證`
- **測試者:** AI 助手（Marvis File Agent）

## 受影響 API 或資料流程

| Method | Path / Flow | 說明 | 變更類型 |
|---|---|---|---|
| `POST` | `/api/file/upload-url` | 建立 R2 Presigned Upload URL；加上 `AuthenticatedGuard` | 修改 |
| `POST` | `/api/file` | 建立 File Metadata；加上 `AuthenticatedGuard` | 修改 |
| Flow | 前端 `/files` → BFF `/api/file/upload-url` | 未登入時前端不再提供上傳入口 | 修改 |
| Flow | 前端 `/files` → BFF `/api/file` | 同上（上傳完成後建立 metadata 的呼叫） | 修改 |

## 前置條件

- 環境變數：`PUBLIC_SERVICE_DATABASE_URL`、JWT 與 R2 相關設定沿用既有 `.env`（本次未新增、未修改，`API_ORIGIN` / `WEB_ORIGIN` 維持原值）。
- Database / migration：無 schema 變更。
- 測試資料：以既有 `POST /api/auth/register` 建立 `@verify-e2e.local` 網域的臨時帳號；驗證結束後刪除該帳號，並刪除測試產生的 `StoredFileMeta`（`objectKey` 前綴 `uploads/verify-tmp/`）。驗證前後皆以唯讀探測確認 `users` 為 0 筆，未動到 seed 與既有資料。
- 測試檔案與 metadata：本次以臨時 E2E 腳本（tsx）執行，未新增 vitest 測試檔（見備註）。
- Cookie / Token / OAuth 條件：以 `POST /api/auth/register` 取得 HttpOnly `access_token` cookie；未登入案例刻意不帶 cookie。
- Email / 外部服務條件：僅向 R2 取得 presigned URL，未實際上傳物件，不在雲端留下檔案。

## 測試案例

### 成功案例

| 編號 | 條件 / Request | 預期 Status | 預期結果 | 實際結果 |
|---|---|---:|---|---|
| FILE-AUTH-001 | 已登入 `POST /api/file/upload-url` | 201 | 回應含 `url`、`objectKey`，`url` 指向 R2（`*.r2.cloudflarestorage.com`） | PASS |
| FILE-AUTH-002 | 已登入 `POST /api/file`（不帶 `bytes`） | 201 | 建立 metadata 並回傳實體 | PASS |
| FILE-AUTH-003 | 已登入經 BFF `POST /api/file/upload-url` | 201 | 同上；cookie 由 Route Handler 轉發，瀏覽器不接觸 token | PASS |
| FILE-AUTH-004 | 已登入經 BFF `POST /api/file` | 201 | 建立 metadata | PASS |

### 失敗與邊界案例

| 編號 | 條件 / Request | 預期 Status | 預期錯誤 | 實際結果 |
|---|---|---:|---|---|
| FILE-AUTH-ERR-001 | 未登入 `POST /api/file/upload-url` | 401 | `Access token is missing` | PASS |
| FILE-AUTH-ERR-002 | 未登入 `POST /api/file` | 401 | `Access token is missing` | PASS |
| FILE-AUTH-ERR-003 | 已登入 `POST /api/file` 帶 `bytes = 1024` | 201 | 建立 metadata | FAIL（回 500，見備註；資料實際已寫入資料庫） |

## 驗證指令與結果

```text
執行指令：
- pnpm run build（apps/backend）
- pnpm exec tsc --noEmit（apps/frontend）
- pnpm -w run lint
- 臨時 E2E 腳本（tsx）：三情境（未登入 / 已登入非 ADMIN / 已登入 ADMIN）與上傳流程

結果：
- backend build：PASS
- frontend typecheck：PASS
- lint：PASS（0 errors、10 warnings，警告皆為既有檔案）
- 未登入：後端 /api/file/upload-url 回 401、前端 /files 不顯示上傳面板、首頁顯示「請先登入」：PASS
- 已登入：後端與 BFF 的 upload-url 皆回 201 並取得 R2 presigned URL：PASS
- 已登入 POST /api/file（不帶 bytes）：201 PASS；（帶 bytes）：500 FAIL（既有問題，已記錄）
- 測試帳號與測試 metadata 清理：PASS（事後 users 0 筆、stored_file_meta 測試列 0 筆）
```

## 備註

- `POST /api/file` 帶 `bytes` 時回 500：`StoredFileMeta.bytes` 為 `BigInt`，Controller 直接回傳 Prisma 實體，回應序列化時拋出 `Do not know how to serialize a BigInt`。此問題在本次變更前即存在（與登入驗證無關），已記錄於 `docs/已知錯誤/2026-09-23-bigint-serialization-file-metadata.md`，本次未修正。
- 授權沿用既有 `AuthenticatedGuard`，未新增權限碼、未修改 seed；`GET /api/file`、`PATCH`、`DELETE` 等端點維持既有狀態，不在本次變更範圍。
- 本次以臨時 E2E 腳本驗證，未新增 vitest 測試檔；後續若要納入自動測試，建議新增 `test/file-upload-auth.e2e-spec.ts`。
- [ ] 測試文件已與 API 變更一同提交（專案目前尚無 commit，待首次提交時一併納入）
- [x] 對應 API 測試已通過（`POST /api/file` 帶 `bytes` 的既有問題除外，已記錄）
- [x] 必要的完整測試、Lint 與 Build 已通過

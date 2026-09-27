# JWT Refresh、Axios 與 Auth API 測試文件

## 測試資訊

- **Module:** `public-service/auth`、frontend auth client、`@test/shared`
- **日期:** 2026-09-27
- **變更 Commit:** `feat(auth): 統一 JWT session、refresh 與 Axios 流程`
- **測試者:** Codex

## 受影響 API 或資料流程

| Method | Path / Flow | 說明 | 變更類型 |
|---|---|---|---|
| `POST` | `/api/auth/register` | 帳密註冊並設定 access/refresh JWT Cookie | 修改 |
| `POST` | `/api/auth/login` | 帳密登入並建立裝置 Session | 修改 |
| `POST` | `/api/auth/refresh` | 核對 Session 雜湊並輪替 refresh JWT | 新增 |
| `GET` | `/api/auth/me` | 驗證 access JWT 與有效 Session | 修改 |
| `POST` | `/api/auth/logout` | 撤銷目前裝置 Session 並清除 Cookie | 修改 |
| `GET` | `/api/auth/google`、`/api/auth/github` | 瀏覽器導頁啟動 OAuth 並驗證 state | 修改 |
| Flow | Axios 401 refresh | 單次重試、並發共用 refresh、失敗清除登入狀態 | 修改 |
| Flow | API response / CORS / CSRF | 統一 envelope、精確 origin 與 mutation Origin 檢查 | 修改 |

## 前置條件

- 環境變數：使用兩端 `.env.example` 所列設定；本機前後端皆使用 `localhost`。
- Database / migration：既有 `Session` 已包含 `tokenHash`、`expiresAt`、`revokedAt`，不需新增 migration；migration status 已確認最新。
- 測試資料：HTTP 流程建立一次性 `codex.auth.*@example.com` 使用者，完成後依 ID 與 email 精確刪除，殘留為 0。
- Cookie / Token：access 與 refresh 均為 JWT HttpOnly Cookie；refresh token 在 DB 僅存 SHA-256 雜湊。
- 外部服務：未提供 Google / GitHub 真實憑證，因此 OAuth 僅完成 build、路由與靜態流程驗證。

## 測試案例

### 成功案例

| 編號 | 條件 / Request | 預期 Status | 預期結果 | 實際結果 |
|---|---|---:|---|---|
| AUTH-001 | 帳密註冊 | 201 | 統一 envelope，設定兩枚 HttpOnly Cookie，body 無 token | PASS |
| AUTH-002 | 帶 access Cookie 呼叫 `/auth/me` | 200 | 回傳 JSON-safe `AuthSessionData` | PASS |
| AUTH-003 | 帶 refresh Cookie 呼叫 `/auth/refresh` | 200 | 新 access JWT 且 refresh JWT 已輪替 | PASS |
| AUTH-004 | 帳密登入後登出 | 200 | 撤銷目前 Session，兩枚 Cookie 清除 | PASS |
| AUTH-005 | 合法 frontend origin 的 CORS preflight | 204 | exact allow-origin 且 allow-credentials | PASS |

### 失敗與邊界案例

| 編號 | 條件 / Request | 預期 Status | 預期錯誤 | 實際結果 |
|---|---|---:|---|---|
| AUTH-ERR-001 | 未登入呼叫 `/auth/me` | 401 | 統一錯誤 envelope | PASS |
| AUTH-ERR-002 | 重放已輪替 refresh JWT | 401 | 拒絕並撤銷受影響 Session | PASS |
| AUTH-ERR-003 | 重放後再使用該 Session 的 access JWT | 401 | Session 已撤銷 | PASS |
| AUTH-ERR-004 | 登出後再使用 access JWT | 401 | Session 已撤銷 | PASS |
| AUTH-ERR-005 | 惡意 Origin 發送 mutation | 403 | Origin 不在 allowlist | PASS |

## 驗證指令與結果

```text
- pnpm.cmd --dir packages/shared run build：PASS
- pnpm.cmd --dir apps/backend run public-service:validate：PASS
- pnpm.cmd --dir apps/backend run public-service:generate：PASS（Prisma Client 7.10.0）
- pnpm.cmd --dir apps/backend exec prisma migrate status --config ...：PASS（4 migrations，schema up to date）
- pnpm.cmd --dir apps/backend run test：PASS（3 files，7 tests）
- pnpm.cmd --dir apps/backend run build：PASS
- 受影響 frontend TypeScript program：PASS
- 實際 HTTP register/me/refresh/replay/login/logout/401/CORS/CSRF：PASS
- 完整 frontend typecheck/build：FAIL（既有 _drafts/privacy/page.tsx 與 Sidebar.tsx 非法字元，非本次變更）
```

## 備註

- [x] 測試文件已與 API 變更一同建立
- [x] 對應 unit 與實際 HTTP 流程已通過
- [ ] Google / GitHub provider 真實 callback 尚待部署憑證與控制台設定後人工驗證
- [ ] 完整 frontend typecheck/build 尚待修復既有語法錯誤

---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 82aeac45cfbef6522c2897f88cab62f4_b2f60b88b71111f1a38a525400248c00
    ReservedCode1: a0kKsZrZTGqkMRCc9mzAI8EOuCYEK7XALtKhSOQl9+/fsDymfhM/Es38yZFZ/PNEwgqr6p+7aKdJ/8KncCi+IvzOB0pdmnnqFObyyoNvnxJqDmCP5jewTEKveKIERtmoeaLzNKgxDq8TQjEgU4Mky7xNYD53v6KkmY5mkDqYHfpwFXLm+JccnoWX9Ag=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 82aeac45cfbef6522c2897f88cab62f4_b2f60b88b71111f1a38a525400248c00
    ReservedCode2: a0kKsZrZTGqkMRCc9mzAI8EOuCYEK7XALtKhSOQl9+/fsDymfhM/Es38yZFZ/PNEwgqr6p+7aKdJ/8KncCi+IvzOB0pdmnnqFObyyoNvnxJqDmCP5jewTEKveKIERtmoeaLzNKgxDq8TQjEgU4Mky7xNYD53v6KkmY5mkDqYHfpwFXLm+JccnoWX9Ag=
---

# Permission 模組 API 測試文件

## 測試資訊

- **Module:** `public-service/auth/permission`
- **日期:** 2026-09-23
- **變更 Commit:** `feat(public-service): 新增細粒度權限模組（Permission / RolePermission）與管理 API`
- **測試者:** AI 助手（Marvis File Agent）

## 受影響 API 或資料流程

| Method | Path / Flow | 說明 | 變更類型 |
|---|---|---|---|
| `GET` | `/api/permissions/me` | 取得自己的角色與權限碼（僅需登入） | 新增 |
| `GET` | `/api/admin/apps` | App 清單 | 新增 |
| `GET` | `/api/admin/apps/:appId` | 單一 App | 新增 |
| `POST` | `/api/admin/apps` | 建立 App | 新增 |
| `PATCH` | `/api/admin/apps/:appId` | 修改 App | 新增 |
| `DELETE` | `/api/admin/apps/:appId` | 刪除 App | 新增 |
| `GET` | `/api/admin/apps/:appId/roles` | 角色清單 | 新增 |
| `GET` | `/api/admin/apps/:appId/roles/:roleId` | 單一角色 | 新增 |
| `POST` | `/api/admin/apps/:appId/roles` | 建立角色 | 新增 |
| `PATCH` | `/api/admin/apps/:appId/roles/:roleId` | 修改角色 | 新增 |
| `DELETE` | `/api/admin/apps/:appId/roles/:roleId` | 刪除角色 | 新增 |
| `GET` | `/api/admin/permissions` | 權限碼清單 | 新增 |
| `GET` | `/api/admin/permissions/:permissionId` | 單一權限碼 | 新增 |
| `POST` | `/api/admin/permissions` | 建立權限碼 | 新增 |
| `PATCH` | `/api/admin/permissions/:permissionId` | 修改權限碼 | 新增 |
| `DELETE` | `/api/admin/permissions/:permissionId` | 刪除權限碼 | 新增 |
| `GET` | `/api/admin/roles/:roleId/permissions` | 查詢角色已指派的權限碼 | 新增 |
| `POST` | `/api/admin/roles/:roleId/permissions` | 追加指派權限碼（冪等） | 新增 |
| `PUT` | `/api/admin/roles/:roleId/permissions` | 整批覆蓋權限碼 | 新增 |
| `DELETE` | `/api/admin/roles/:roleId/permissions/:permissionId` | 移除單一權限碼 | 新增 |
| Flow | 授權鏈（AuthenticatedGuard → PermissionGuard） | 401 / 403 `NO_APP_ROLE` / 403 `PERMISSION_DENIED` | 新增 |

## 前置條件

- 環境變數：`DATABASE_URL`（本機 PostgreSQL，5432 埠已確認可連線）、JWT 相關設定沿用既有 `.env`。
- Database / migration：`20260923095057_add_permission_model`（新增 `Permission`、`RolePermission`）。
- 測試資料：測試檔自行建立 `public-service` App、`ADMIN` 角色、權限碼與三種測試使用者（ADMIN、無角色、有角色但缺權限碼）。
- 測試檔案與 metadata：`test/permission.e2e-spec.ts`，執行時須帶 `--config vitest.config.e2e.ts`。
- Cookie / Token / OAuth 條件：以 HttpOnly `access_token` cookie 或 `Authorization: Bearer` 取得身分。
- Email / 外部服務條件：無，不涉及外部服務。

## 測試案例

### 成功案例

| 編號 | 條件 / Request | 預期 Status | 預期結果 | 實際結果 |
|---|---|---:|---|---|
| PERM-001 | ADMIN 帶 Bearer token 呼叫管理 API（`GET /api/admin/apps`） | 200 | 回傳 App 清單 | PASS |
| PERM-002 | 呼叫既有未受保護的 `GET /api/apps` | 404 | 舊模組未被權限模組意外註冊 | PASS |
| PERM-003 | ADMIN 呼叫 `GET /api/permissions/me` | 200 | 回傳自己的角色與權限碼 | PASS |
| PERM-004 | 無任何角色的使用者呼叫 `GET /api/permissions/me` | 200 | 回傳空清單，非 403 | PASS |
| PERM-005 | `POST /api/admin/permissions` 建立權限碼 | 201 | 回傳新建權限碼 | PASS |
| PERM-006 | `GET /api/admin/permissions` | 200 | 清單含新建權限碼 | PASS |
| PERM-007 | `PATCH /api/admin/permissions/:permissionId` | 200 | 權限碼已更新 | PASS |
| PERM-008 | `DELETE /api/admin/permissions/:permissionId` | 200 | 權限碼已刪除 | PASS |
| PERM-009 | 對同一角色重複 `POST /api/admin/roles/:roleId/permissions` | 201 | 指派具冪等性，不產生重複資料 | PASS |
| PERM-010 | 在 `public-service` 下建立角色並查詢、刪除 | 201 / 200 / 200 | 角色 CRUD 正常 | PASS |

### 失敗與邊界案例

| 編號 | 條件 / Request | 預期 Status | 預期錯誤 | 實際結果 |
|---|---|---:|---|---|
| PERM-ERR-001 | 未帶 Access Token 呼叫管理 API | 401 | 需要登入驗證 | PASS |
| PERM-ERR-002 | 帶無效 Access Token 呼叫管理 API | 401 | 需要登入驗證 | PASS |
| PERM-ERR-003 | 未登入呼叫 `GET /api/permissions/me` | 401 | 需要登入驗證 | PASS |
| PERM-ERR-004 | 已登入但無 `public-service` 任何角色 | 403 | `code = NO_APP_ROLE` | PASS |
| PERM-ERR-005 | 有 `public-service` 角色但缺少所需權限碼 | 403 | `code = PERMISSION_DENIED` | PASS |
| PERM-ERR-006 | `POST /api/admin/permissions` 建立重複權限碼 | 409 | 權限碼衝突 | PASS |
| PERM-ERR-007 | 權限碼格式不合法（不符合 `/^[a-z0-9:_-]+$/`） | 400 | DTO 驗證失敗 | PASS |
| PERM-ERR-008 | 指派不存在的權限 ID | 400 | 找不到權限碼 | PASS |
| PERM-ERR-009 | 把 `app:read` 自 ADMIN 角色移除後呼叫管理 API，之後補回 | 403 → 200 | `code = PERMISSION_DENIED`，補回後恢復 | PASS |
| PERM-ERR-010 | 移除角色權限後，該角色使用者再呼叫管理 API | 403 | `code = PERMISSION_DENIED` | PASS |

## 驗證指令與結果

```text
執行指令：
- pnpm run public-service:validate
- pnpm.cmd exec vitest run --config vitest.config.e2e.ts test/permission.e2e-spec.ts
- pnpm.cmd exec vitest run --config vitest.config.e2e.ts
- pnpm run build
- pnpm run lint
- pnpm run test

結果：
- public-service:validate：PASS（schemas 有效）
- permission.e2e-spec.ts：PASS（20/20）
- 全部 e2e：20 PASS / 1 FAIL（test/app.e2e-spec.ts 的 `GET /` 期待 200 實得 404，屬既有 AppController 未註冊根路由的既有問題，與本模組無關，非本次任務範圍）
- build：PASS
- lint：PASS（0 errors、11 warnings，警告皆為既有檔案的未使用 import 與空檔案）
- unit test：PASS（2 檔、3 測試）
```

## 備註

- 測試檔必須以 `--config vitest.config.e2e.ts` 執行，直接以檔名篩選會出現 "No test files found"。
- `test/app.e2e-spec.ts` 的失敗為既有問題，未在本次任務範圍內修正，避免變更既有 auth / file / notification 模組行為。
- [x] 測試文件已與 API 變更一同提交
- [x] 對應 API 測試已通過
- [x] 必要的完整測試、Lint 與 Build 已通過
*（内容由AI生成，仅供参考）*

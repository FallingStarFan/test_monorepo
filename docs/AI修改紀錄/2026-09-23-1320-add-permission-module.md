---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 82aeac45cfbef6522c2897f88cab62f4_b4ff24f2b71111f1a38a525400248c00
    ReservedCode1: jhsoOCGeNKjMY651v6Zv46oRxNCYgzgM7/bmUQp4RMnykCmCiPUKFi8npvCD1MlQDnsCzOIfLjrvGN+0Ds5n641AveVC4PlPPTL8fXIG0/+SVeGXCTmrKg9XcHAPORJiD5KLWuWu8/DvYtuANz9Osz0Zh82YrI/UqEep8LsRsCwoqw5WGrt8or43UFM=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 82aeac45cfbef6522c2897f88cab62f4_b4ff24f2b71111f1a38a525400248c00
    ReservedCode2: jhsoOCGeNKjMY651v6Zv46oRxNCYgzgM7/bmUQp4RMnykCmCiPUKFi8npvCD1MlQDnsCzOIfLjrvGN+0Ds5n641AveVC4PlPPTL8fXIG0/+SVeGXCTmrKg9XcHAPORJiD5KLWuWu8/DvYtuANz9Osz0Zh82YrI/UqEep8LsRsCwoqw5WGrt8or43UFM=
---

# 新增 public-service 細粒度權限模組

- 日期：2026-09-23 13:20（Asia/Taipei）
- 任務：在 `apps/backend` 的 public-service 完成 permission 模組（Permission / RolePermission、Guard、Decorator、管理 API），並補上自動測試與測試紀錄。

## 修改

- `src/module/public-service/prisma/db/auth.prisma`：新增 `Permission`（`code` 唯一）與 `RolePermission`（複合主鍵 `roleId + permissionId`、`onDelete: Cascade`）。放在同一個 auth schema，是因為每個請求都要一次查完「使用者 → 角色 → 權限碼」，跨 schema 關聯會被迫拆成兩次查詢。
- `src/module/public-service/prisma/migrations/20260923095057_add_permission_model/migration.sql`：以 `prisma migrate diff` 離線產生，供部署端 `migrate deploy` 使用。
- `src/module/public-service/auth/permission/permission.constants.ts`：集中管理權限碼與授權邏輯常數，避免字串散落各處。
- `src/module/public-service/auth/permission/permission.service.ts`：`findUserAppAccess` 與 Permission CRUD。
- `src/module/public-service/auth/permission/role-permission.service.ts`：角色權限指派（追加、整批覆蓋、移除）。
- `src/module/public-service/auth/permission/guards/authenticated.guard.ts`、`guards/permission.guard.ts`：`PermissionGuard` 繼承 `AuthenticatedGuard`，依序回 401 → 403 `NO_APP_ROLE` → 403 `PERMISSION_DENIED`。
- `src/module/public-service/auth/permission/decorators/permission.decorators.ts`：`@RequireRole` / `@RequirePermission`，讓 Controller 宣告所需權限碼。
- `src/module/public-service/auth/permission/dto/**`、`controllers/**`、`permission.module.ts`：新增 admin 管理 API（`/api/admin/*`）與 `GET /api/permissions/me`。管理 API 未沿用既有未註冊的 App/Role controller，是因那些模組在執行期未生效，直接啟用會多出未受保護的端點。
- `src/module/public-service/auth/app/app.service.ts`：補上 `findByIdOrFail` / `create` / `update` / `remove`（含 `cascadedRoleCount`）供管理 API 使用；同時移除未使用的 `Prisma` import。
- `src/common/response/filters/http-exception.filter.ts`：例外若帶 `code` 才附加 `code` 欄位，讓前端能分辨 `NO_APP_ROLE` 與 `PERMISSION_DENIED`；既有錯誤回應形狀不變。
- `src/module/public-service/prisma/seed/permission.seed.ts`：seed `public-service` App、`ADMIN` 角色與預設權限碼。
- `test/permission.e2e-spec.ts`：新增 20 項 vitest + supertest 測試；其中原「指派權限後一般角色即可通過 Guard」的案例改為「ADMIN 角色移除 `app:read` 後回 403、補回後恢復 200」，因為管理 API 的授權是「ADMIN 角色」與「所需權限碼」兩者皆須成立，一般角色無法通過角色檢查，該測法在設計上不成立。

## 影響

- API：新增 `/api/admin/*` 與 `/api/permissions/me`；既有 auth / file / notification 模組的 API contract 未變更。
- Database：新增 `Permission`、`RolePermission` 兩張表與 migration；既有資料表未調整。
- 設定：無新增環境變數。
- 相容性：無破壞性變更；錯誤回應僅在例外帶 `code` 時多一個欄位。

## 驗證

- `pnpm run public-service:validate`：PASS
- `pnpm.cmd exec vitest run --config vitest.config.e2e.ts test/permission.e2e-spec.ts`：PASS（20/20）
- `pnpm run build`：PASS
- `pnpm run lint`：PASS（0 errors、11 warnings 皆為既有檔案）
- `pnpm run test`（unit）：PASS（2 檔、3 測試）
- 全部 e2e（`vitest.config.e2e.ts`）：20 PASS / 1 FAIL，失敗者為 `test/app.e2e-spec.ts` 的 `GET /`（期待 200 實得 404），屬既有未註冊根路由問題，非本次範圍
- 實際 `prisma migrate deploy` 對資料庫套用：NOT TESTED（本次以離線 diff 產生 SQL，未對正式資料庫執行部署）
*（内容由AI生成，仅供参考）*

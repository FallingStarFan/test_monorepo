---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 82aeac45cfbef6522c2897f88cab62f4_b67472e8b71111f1a38a525400248c00
    ReservedCode1: p/C2IFmDgTBpE47ElsuF4VooGpTY3DwGnE4vDgZiiSHx8Wq6q+POjT+QsqYrtCynNm3oAKoSg9ve+S3At0xtrWkRRrGPIIW7DdUq5jplDpu+70fqT59ctv7xcumNm3kEvkkqYz7rGJYxnwzFhN/D4pHgJJaQVVDXcr9oG4qVCdIRvJiZQXO9qsq7+9E=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 82aeac45cfbef6522c2897f88cab62f4_b67472e8b71111f1a38a525400248c00
    ReservedCode2: p/C2IFmDgTBpE47ElsuF4VooGpTY3DwGnE4vDgZiiSHx8Wq6q+POjT+QsqYrtCynNm3oAKoSg9ve+S3At0xtrWkRRrGPIIW7DdUq5jplDpu+70fqT59ctv7xcumNm3kEvkkqYz7rGJYxnwzFhN/D4pHgJJaQVVDXcr9oG4qVCdIRvJiZQXO9qsq7+9E=
---

# 新增 public-service 細粒度權限模組

## Commit 資訊

- **Commit:** `feat(public-service): 新增細粒度權限模組與管理 API`
- **日期:** 2026-09-23
- **作者:** AI 助手（Marvis File Agent）
- **相關 Issue / PR:** N/A

## 變更目的

既有 `App` / `Role` / `UserRole` 只能表達「使用者屬於哪個 App 的哪個角色」，
無法表達「這個角色能做哪些操作」。本次在 public-service 加入 Permission /
RolePermission 與 Guard，讓 Controller 能以權限碼宣告需求，並把 App、Role、
Permission 的管理收斂到只有 `public-service` 的 `ADMIN` 角色能執行。

## 變更內容

- [x] 新增：`auth.prisma` 的 `Permission`、`RolePermission`（同 auth schema）。
- [x] 新增：migration `20260923095057_add_permission_model`。
- [x] 新增：`permission` 模組（constants / services / guards / decorators / dtos / controllers / module）。
- [x] 新增：admin 管理 API `/api/admin/*` 與 `GET /api/permissions/me`。
- [x] 新增：`permission.seed.ts`（`public-service` App、`ADMIN` 角色、預設權限碼）。
- [x] 新增：`test/permission.e2e-spec.ts`（vitest + supertest，20 項）。
- [x] 修改：`app.service.ts` 補上 App 的 CRUD 方法。
- [x] 修改：`http-exception.filter.ts` 於例外帶 `code` 時附加 `code` 欄位。
- [ ] 移除：無。

## 影響範圍

- **API / 功能:** 僅新增端點。既有 auth / file / notification 的行為與 contract 不變。
- **資料庫 / 設定:** 新增兩張表；無新增環境變數。
- **相容性:** 無破壞性變更。錯誤回應只在例外帶 `code` 時多出欄位。

## 驗證方式

```text
執行的指令：
- pnpm run public-service:validate
- pnpm.cmd exec vitest run --config vitest.config.e2e.ts test/permission.e2e-spec.ts
- pnpm run build
- pnpm run lint
- pnpm run test
```

驗證結果：

- `public-service:validate`：PASS
- permission e2e：PASS（20/20）
- `build`：PASS
- `lint`：PASS（0 errors、11 warnings 皆為既有檔案）
- unit test：PASS（2 檔、3 測試）
- 全部 e2e：20 PASS / 1 FAIL（`test/app.e2e-spec.ts` 的 `GET /` 為既有問題，非本次範圍）

## 其他注意事項

- 管理 API 授權條件是「`public-service` 的 `ADMIN` 角色」且「具備所需權限碼」，兩者須同時成立。
- 既有 `/apps`、`/apps/:appId/roles` 端點在執行期並未註冊，本次刻意不啟用，避免出現未受權限保護的管理端點；後續若需要，應在 permission 模組內以受保護的方式提供。
- migration 以 `prisma migrate diff` 離線產生，實際對資料庫部署（`prisma migrate deploy`）尚未執行。
- `apps/backend` 為 `test_backend` 的副本，原始專案未變動。
*（内容由AI生成，仅供参考）*

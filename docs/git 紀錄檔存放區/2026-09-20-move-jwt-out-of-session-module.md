# Git Commit 紀錄

## Commit 資訊

- **Commit:** `refactor(auth): move jwt out of session module`
- **日期:** 2026-09-20
- **作者:** Git 使用者
- **相關 Issue / PR:** `N/A`

## 變更目的

JWT 不使用 `sessions` table，因此不應由 `SessionModule` 或 `SessionService` 負責。將 JWT 移到 auth service 的 jwt 目錄，讓責任與測試方式清楚，並提供 Swagger 可驗證 HttpOnly JWT cookie 的 API。

## 變更內容

- [x] 新增：`JwtAuthModule`、`JwtAuthService`、JWT unit test 與 `GET /auth/me`。
- [x] 修改：`AuthModule`、`AuthService` 與 API 測試文件。
- [x] 修正：移除 session 命名對 JWT 的誤導。
- [x] 移除：`SessionModule` 與 `SessionService` 對 JWT 的依賴。

## 影響範圍

- **API / 功能:** 新增 `GET /auth/me` 驗證 `access_token` cookie；內部責任重新命名。
- **資料庫 / 設定:** 不使用 `sessions` table；schema 暫時保留。
- **相容性:** 不新增資料庫需求；`AuthService.validateAccessToken` 取代內部舊命名。

## 驗證方式

```text
執行的指令：
- pnpm test -- src/module/public-service/auth/services/jwt/jwt.service.spec.ts
- pnpm run build
- pnpm run lint

驗證結果：
- JWT unit test 通過：1 個測試檔、2 個測試。
- `pnpm run build` 通過。
- `pnpm test` 通過：2 個測試檔、3 個測試。
- `pnpm run lint` 通過，僅有既有 warning。
- 新增 `/auth/me` 後 `pnpm run build` 通過。
- 新增 `/auth/me` 後 `pnpm test` 通過：2 個測試檔、3 個測試。
```

## 其他注意事項

JWT unit test 使用記憶體中的 secret，不需要資料庫；純 JWT 登出仍只能清除 cookie，不能撤銷已簽發 token。
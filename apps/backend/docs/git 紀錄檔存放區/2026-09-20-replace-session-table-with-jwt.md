# Git Commit 紀錄

## Commit 資訊

- **Commit:** `feat(auth): replace session table with jwt`
- **日期:** 2026-09-20
- **作者:** Git 使用者
- **相關 Issue / PR:** `N/A`

## 變更目的

將登入狀態改為由 JWT 驗證，不再使用 `sessions` table 儲存或查詢登入 token。

## 變更內容

- [x] 新增：JWT 登入、驗證、logout endpoint 與 HttpOnly cookie 流程。
- [x] 修改：AuthService、SessionService、auth controller 與 auth module。
- [ ] 修正：無。
- [ ] 移除：Session table 依賴與無法實現的資料庫撤銷流程。

## 影響範圍

- **API / 功能:** 登入與 OAuth callback 改簽發 JWT；新增 logout 清除 cookie；驗證不查詢 `sessions` table。
- **資料庫 / 設定:** 執行時不再使用 `sessions` table；需要 `JWT_ACCESS_SECRET` 與 `JWT_ACCESS_EXPIRES`。
- **相容性:** Session 查詢與撤銷 API 將不再適用，屬於 API 行為變更。

## 驗證方式

```text
執行的指令：
- pnpm run build
- pnpm run lint
- pnpm test

驗證結果：
- `pnpm run build` 通過。
- `pnpm run lint` 通過，但有既有及使用者預先建立空檔案的 warning。
- `pnpm test` 通過：1 個測試檔、1 個測試。
```

## 其他注意事項

純 JWT 無法在不保存撤銷狀態的情況下立即撤銷已簽發 token；登出後既有 token 仍可使用至過期。現有 `sessions` table schema 暫時保留但不再被程式使用；若要刪除，需另建立 migration 並確認既有資料需求。
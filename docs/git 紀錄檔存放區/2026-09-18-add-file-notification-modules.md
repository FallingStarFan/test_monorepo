# Git Commit 紀錄

## Commit 資訊

- **Commit:** `feat(public-service): add file and notification modules`
- **日期:** 2026-09-18
- **作者:** Git 使用者
- **相關 Issue / PR:** `N/A`

## 變更目的

完成 Public Service 的檔案與通知模組，並同步更新資料庫模型、migration、OAuth 環境設定及 Swagger 設定路徑。

## 變更內容

- [x] 新增：檔案與通知模組、服務、控制器、Prisma schema 與 migration。
- [x] 修改：應用程式模組註冊、環境設定、OAuth callback、Swagger 載入路徑與 Prisma 生成檔。
- [ ] 修正：無。
- [ ] 移除：舊 Swagger 設定路徑。

## 影響範圍

- **API / 功能:** 新增檔案與通知相關 API，並更新 OAuth redirect 與 Swagger 文件設定。
- **資料庫 / 設定:** 新增 file/notification schema 與 migration，改用 API、Web、OAuth 環境變數。
- **相容性:** 無破壞性變更。

## 驗證方式

```text
執行的指令：
- pnpm run build
- pnpm run lint
- pnpm test

驗證結果：
- `pnpm run build` 通過。
- `pnpm run lint` 通過，僅有既有的 `src/common/response/filters/http-exception.filter.ts` 未使用 `request` 警告。
- `pnpm test` 通過：1 個測試檔、1 個測試。
```

## 其他注意事項

部署前請確認 `APP_NAME`、`APP_VERSION`、`API_ORIGIN`、`WEB_ORIGIN`、`SERVER_PORT` 及 OAuth 環境變數已設定，並套用新的資料庫 migration。
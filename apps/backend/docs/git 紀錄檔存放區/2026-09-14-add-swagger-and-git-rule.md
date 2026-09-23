# Git Commit 紀錄

## Commit 資訊

- **Commit:** `feat(api): add Swagger documentation and Git record rule`
- **日期:** 2026-09-14
- **作者:** Git 使用者
- **相關 Issue / PR:** `N/A`

## 變更目的

啟用 NestJS Swagger API 文件，並建立專案級規則，要求每次修改先留下 Markdown Git 紀錄，再進行 commit 或 push。

## 變更內容

- [x] 新增：`src/swagger/swagger.config.ts`
- [x] 新增：`.github/copilot-instructions.md`
- [x] 新增：本次 Git 變更紀錄
- [x] 修改：`src/main.ts`，註冊 Swagger 並輸出服務網址
- [x] 修改：Git 紀錄撰寫指南，將紀錄列為必要流程

## 影響範圍

- **API / 功能:** Swagger UI 位於 `/docs`。
- **資料庫 / 設定:** 無。
- **相容性:** 無破壞性變更。

## 驗證方式

```text
pnpm test
pnpm run lint
pnpm run build
```

驗證結果：全部通過。

## 其他注意事項

提交完成後可使用 `git log` 查詢 commit hash。
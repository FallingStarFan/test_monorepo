# Git Commit 紀錄

## Commit 資訊

- **Commit:** `docs(api): add module test templates and push rule`
- **日期:** 2026-09-19
- **作者:** Git 使用者
- **相關 Issue / PR:** `N/A`

## 變更目的

建立統一的 API 測試文件範本，並明確規範 API 變更後必須先完成對應測試，通過驗證後才能 commit 與 push。

## 變更內容

- [x] 新增：各 module API 測試文件資料夾與統一 `template.md`。
- [x] 修改：專案工作規則，加入 API 變更與 push 前測試要求。
- [ ] 修正：無。
- [ ] 移除：無。

## 影響範圍

- **API / 功能:** 僅新增測試文件管理規範，不改變執行時 API。
- **資料庫 / 設定:** 無。
- **相容性:** 無破壞性變更。

## 驗證方式

```text
執行的指令：
- git diff --check

驗證結果：
- `git diff --check` 通過；僅顯示既有 `package.json` 與 `pnpm-lock.yaml` 的行尾格式警告。
```

## 其他注意事項

API 變更的 commit 必須在對應 module 測試文件中記錄測試案例與實際驗證指令；測試未通過時不得 commit 或 push。
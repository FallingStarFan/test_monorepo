# API 測試文件

本資料夾依照 `src/module/` 的 module 結構存放 API 測試文件。根目錄只有一份統一的 `template.md`，API 變更時請複製該模板到對應 module 資料夾。

## Module 對照

- `apps/`：`src/module/apps/`
- `public-service/auth/`：`src/module/public-service/auth/`
- `public-service/file/`：`src/module/public-service/file/`
- `public-service/notification/`：`src/module/public-service/notification/`
- `public-service/prisma/`：`src/module/public-service/prisma/`

## 使用規則

1. API 變更前，複製根目錄的 `template.md` 到對應 module 資料夾並建立測試文件。
2. 測試文件必須列出受影響的 endpoint、成功案例、失敗案例與驗證指令。
3. API 變更完成後，執行對應測試；必要時再執行完整測試、Lint 與 Build。
4. 測試未通過或沒有更新對應測試文件時，不得建立 commit，也不得 push。
5. 測試文件與 API 變更必須放在同一個 commit，並在 Git 紀錄中填寫實際測試結果。

# Git Commit 紀錄

## Commit 資訊

- **Commit:** `docs(prisma): add Prisma usage documentation`
- **日期:** 2026-09-14
- **作者:** Git 使用者
- **相關 Issue / PR:** `N/A`

## 變更目的

新增 Prisma 使用文件，說明目前專案的 Prisma 設定、版本注意事項、資料庫初始化、schema、migration 與 NestJS 整合方式。

## 變更內容

- [x] 新增：Prisma 使用文檔
- [x] 新增：本次 Git 變更紀錄

## 影響範圍

- **API / 功能:** 僅新增文件，不修改執行邏輯。
- **資料庫 / 設定:** 無。
- **相容性:** 無破壞性變更。

## 驗證方式

```text
文件內容依目前 prisma.config.ts、prisma/schema.prisma 與 package.json 撰寫。
git diff --check -- "docs/Prisma 使用文檔.md" "docs/git 紀錄檔存放區/2026-09-14-add-prisma-usage-doc.md"
```

驗證結果：文件已建立，指定文件檢查通過。整體 `git diff --check` 另發現先前 `src/swagger/swagger.config.ts` 第 16 行有尾端空白，本次未修改該既有問題。

## 其他注意事項

文件會明確標示目前 Prisma CLI 8 RC 與 Prisma Client 7.10.0 不一致的問題，避免直接照錯誤版本執行指令。
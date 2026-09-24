# Git Commit 紀錄

## Commit 資訊

- **Commit:** `feat(auth): complete auth role and app updates`
- **日期:** 2026-09-22
- **作者:** Git 使用者
- **相關 Issue / PR:** `N/A`

## 變更目的

提交目前工作區已完成的 authentication、role/app、file/notification 與 Prisma schema/migration 更新，同步提交專案文件與工作規則。

## 變更內容

- [x] 新增：帳密登入 DTO、JWT/auth service、role/app module、Prisma migration、seed 與專案文件。
- [x] 修改：Auth、File、Notification、Prisma、Swagger、環境設定與 module wiring。
- [ ] 修正：無獨立修正項目。
- [ ] 移除：無。

## 影響範圍

- **API / 功能:** 新增或調整帳密登入、JWT cookie、使用者/角色/應用與檔案通知相關 API。
- **資料庫 / 設定:** 更新 auth schema、Prisma generated client、migration、seed 與環境變數範例。
- **相容性:** 有 API 與資料庫 schema 變更，部署前需套用 migration 並確認環境變數。

## 驗證方式

```text
執行的指令：
- pnpm run build
- pnpm test
- pnpm run lint
- git diff --check

驗證結果：
- `pnpm run build` 通過。
- `pnpm test` 通過：2 個測試檔、3 個測試。
- `pnpm run lint` 通過，但有既有及本次新增檔案的 warning。
- `git diff --check` 未通過，原因是部分 source 與 Prisma generated 檔案存在行尾空白；未進行 generated 檔案的大範圍格式重寫。
```

## 其他注意事項

本次 push 會包含目前工作區所有未提交變更；其中包含使用者或自動化工具新增的文件與 module 檔案。若 migration 已套用到資料庫，部署環境需同步執行對應 migration。
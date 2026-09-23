# Git 紀錄文件使用規則

這份規則適用於所有會修改本專案檔案的工作。請使用繁體中文撰寫 Git 紀錄文件；程式碼、指令與 commit message 維持專案原本的格式。

## 必須先讀取的文件

開始修改前，先讀取以下文件：

1. `docs/git 紀錄檔存放區/README.md`：了解紀錄格式、命名方式與必要欄位。
2. `docs/git 紀錄檔存放區/commit-template.md`：複製此模板建立本次變更的紀錄。

## 每次修改的流程

1. 先檢查 `git status`，了解工作區是否已有使用者的未提交變更；不要覆蓋或還原那些變更。
2. 在 `docs/git 紀錄檔存放區/` 建立本次紀錄，檔名使用 `YYYY-MM-DD-簡短主題.md`。
3. 先填寫變更目的、預計變更內容與影響範圍，再開始修改程式碼。
4. 完成修改後，補上實際變更與驗證指令、結果。
5. 執行適用的測試、Lint 或 Build；失敗時將原因記錄在 Markdown 文件中。
6. 確認 Git 紀錄文件與對應修改會放在同一個 commit 中。
7. 只有在使用者明確要求時才建立 commit 或 push；執行前再次確認 staged diff。

## Commit 規則

- 使用 Conventional Commits，例如 `feat(api): add Swagger documentation`。
- 沒有本次 Markdown 紀錄時，不建立 commit，也不執行 push。
- 不要把同一個 commit 的 hash 回填到該 commit 的文件中，避免自我參照；提交後使用 `git log` 查詢 hash。
- 不要提交 `dist/`、`node_modules/` 或 `*.tsbuildinfo` 等建置產物。

## 安全與變更範圍

- 不使用破壞性 Git 指令，例如 `git reset --hard` 或 `git checkout --`，除非使用者明確要求。
- 先保留使用者既有修改，僅處理與當前請求相關的檔案。
- push 前確認遠端名稱、分支與即將推送的 commit，並向使用者說明結果。
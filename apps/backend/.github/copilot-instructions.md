# 專案工作規則

- 每次修改程式碼、設定或文件前，先在 `docs/git 紀錄檔存放區/` 新增或更新一份 Markdown 紀錄。
- Git 紀錄請依照 `docs/git 紀錄檔存放區/commit-template.md` 撰寫，檔名使用 `YYYY-MM-DD-簡短主題.md`。
- 紀錄文件必須與對應的修改放在同一個 commit 中；沒有完成紀錄時，不建立 commit，也不執行 push。
- 提交前執行適用的測試、Lint 或 Build，並將實際指令與結果寫入紀錄文件。
- Commit message 使用 Conventional Commits 格式，例如 `feat(api): add Swagger documentation`。
- API 變更時，必須同步更新 `docs/api 測試文件存放區/` 下對應 module 的測試文件；統一模板位於該資料夾根目錄的 `template.md`。
- API 測試文件必須記錄受影響 endpoint、成功案例、失敗或邊界案例、前置條件、驗證指令與實際結果。
- API 變更完成後，必須先執行對應 API 測試；測試未通過或未補齊對應測試文件時，不得建立 commit，也不得 push。
- Push 前至少執行對應測試；若變更跨 module 或影響共用行為，另外執行完整測試、Lint 與 Build，並將結果寫入 Git 紀錄。
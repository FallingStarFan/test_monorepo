# 修正 path-to-regexp v8 萬用路由

- 日期：2026-09-22 13:40（Asia/Taipei）
- 任務：記錄並修正 NestJS／path-to-regexp v8 的舊式 wildcard route 問題。

## 修改

- `src/module/public-service/file/file.controller.ts`：將舊式 wildcard 改為 v8 的 `*objectKey`，並把路徑片段陣列還原為 object key 字串。
- `docs/已知錯誤/`：建立錯誤知識庫與 wildcard route 紀錄。
- `docs/文件索引.md`、AI 規則：要求相關修改前查閱已知錯誤，並在修正新類型問題後新增紀錄。

## 影響

- API：`GET /files/object/<objectKey>` 保持相同 URL contract，現在可在 v8 路由解析器下註冊。
- Database / 設定：無。

## 驗證

- 靜態搜尋：PASS，確認舊式 syntax 已不存在。
- `pnpm.cmd run build`：PASS。

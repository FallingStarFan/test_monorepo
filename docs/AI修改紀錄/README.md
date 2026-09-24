# AI 修改紀錄

每次 AI 實際修改專案檔案後，在此資料夾新增一份紀錄。只分析、回覆問題或沒有任何
檔案寫入時，不建立紀錄。

## 檔名

`YYYY-MM-DD-HHmm-簡短主題.md`

## 範本

```md
# 簡短主題

- 日期：YYYY-MM-DD HH:mm（Asia/Taipei）
- 任務：

## 修改

- `path/to/file`：原因與結果。

## 影響

- API / Database / 設定 / 相容性：無；或具體說明。

## 驗證

- `command`：PASS / FAIL / NOT TESTED（原因）。
```

紀錄保持在必要範圍內，不貼完整程式碼，不重複正式架構文件。API 或架構有影響時，
仍須同步更新相應的文件。

# `POST /api/file` 帶 `bytes` 時回 500（BigInt 序列化）

## 現象

已登入呼叫 `POST /api/file` 並帶 `bytes` 欄位時，回應為：

```json
{ "statusCode": 500, "message": { "en": "Internal server error", "zh": "伺服器內部錯誤" }, "data": null }
```

但資料其實**已經寫入** `stored_file_meta`。不帶 `bytes` 時同樣的請求回 201。

## 根因

- `file.prisma` 的 `StoredFileMeta.bytes` 型別是 `BigInt?`。
- `StoredFileMetaService.create()` 直接回傳 Prisma 實體。
- 回應序列化使用 `JSON.stringify`，而 `BigInt` 沒有預設序列化行為，會拋出
  `TypeError: Do not know how to serialize a BigInt`，被例外過濾器轉成 500。

研判依據：以同樣的 `JSON.stringify` 處理含 `BigInt` 的查詢結果時，可重現完全相同的錯誤訊息；
且同一端點在 `bytes` 為 `null` 時回 201。

## 重現方式

```text
1. 以任一已登入帳號取得 access_token cookie
2. POST /api/file，body 帶 { objectKey, bytes: 1024 }
   → 500，但 stored_file_meta 出現該筆資料
3. 相同請求移除 bytes
   → 201
```

## 影響

- 任何回傳 `StoredFileMeta` 實體且 `bytes` 非 null 的端點都會踩到（例如 `GET /api/file` 清單、
  `PATCH /api/file/:id`）。
- 前端若在上傳完成後才建立 metadata，會拿到 500，即使資料已建立，顯示與實際狀態不一致。

## 目前的處理

本次任務（檔案上傳加上登入驗證）未修正此問題，因為它屬於既有 API 的回應格式問題，
修正會牽動 `BigInt` 的對外表示方式（`number` / `string`）與前端型別，需另外評估。

## 後續修正建議

- 在 Controller 或序列化層將 `bytes` 轉為 `string` 或 `number`（偏好 `string`，避免超過
  `Number.MAX_SAFE_INTEGER`）。
- 或於 `StoredFileMetaService` 的讀寫回傳值改為 DTO，統一轉換 `BigInt` 欄位。
- 修正後需補上 `POST /api/file`（含 `bytes`）與 `GET /api/file` 的回歸測試。

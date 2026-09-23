# API 測試文件

## 測試資訊

- **Module:** `apps` / `public-service/auth` / `public-service/file` / `public-service/notification` / `public-service/prisma`
- **日期:** YYYY-MM-DD
- **變更 Commit:** `type(scope): subject`
- **測試者:**

## 受影響 API 或資料流程

| Method | Path / Flow | 說明 | 變更類型 |
|---|---|---|---|
| `GET` / `POST` / `N/A` | `/path` |  | 新增 / 修改 / 移除 |

## 前置條件

- 環境變數：
- Database / migration：
- 測試資料：
- 測試檔案與 metadata：
- Cookie / Token / OAuth 條件：
- Email / 外部服務條件：

## 測試案例

### 成功案例

| 編號 | 條件 / Request | 預期 Status | 預期結果 | 實際結果 |
|---|---|---:|---|---|
| MODULE-001 |  | 200 / 201 |  |  |

### 失敗與邊界案例

| 編號 | 條件 / Request | 預期 Status | 預期錯誤 | 實際結果 |
|---|---|---:|---|---|
| MODULE-ERR-001 |  | 400 / 401 |  |  |

## 驗證指令與結果

```text
執行指令：
- pnpm test -- <test-file-or-pattern>
- pnpm run public-service:validate（若涉及 Prisma）
- pnpm run lint
- pnpm run build

結果：
```

## 備註

- [ ] 測試文件已與 API 變更一同提交
- [ ] 對應 API 測試已通過
- [ ] 必要的完整測試、Lint 與 Build 已通過
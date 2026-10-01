# API 自動測試規範與紀錄

## 1. 文件目的

本文件用於規範並記錄：

- Backend API 測試
    
- Frontend API Integration 測試
    
- Swagger 驗證
    
- Authentication / Authorization 測試
    
- API Request / Response
    
- API 修改後的 Regression Test
    

---

# 2. 核心規則

## API 有修改，就必須重新測試

只要 Commit 修改到 API 或可能影響 API 行為的程式碼，就必須重新測試受影響的 API。

包含：

- Controller
    
- DTO
    
- Validation
    
- Service
    
- Guard
    
- Middleware
    
- Authentication
    
- Authorization
    
- Prisma
    
- Database Schema
    
- Response format
    
- Request format
    
- 第三方 API
    
- API Client
    

---

# 3. 不需要全部重測

如果修改與 API 無關，例如：

```text
UI 純視覺調整
CSS
README
文件
與 API 無關的純前端元件
```

則不需要因此重新測試所有 API。

應判斷實際影響範圍。

---

# 4. Backend API 測試

Backend 至少需要確認：

- HTTP Method
    
- URL
    
- Request
    
- DTO Validation
    
- Authentication
    
- Authorization
    
- Status Code
    
- Response
    
- Error Response
    
- Database side effect
    

---

# 5. Frontend API 測試

如果 API 有被 Frontend 使用，必須確認：

- API URL
    
- HTTP Method
    
- Request
    
- Request Type
    
- Response Type
    
- Response parsing
    
- Error handling
    
- Authentication state
    
- UI 行為
    

---

# 6. End-to-End API 流程

對重要 API，應確認：

```text
Frontend
    ↓
API Client
    ↓
HTTP Request
    ↓
Backend Controller
    ↓
DTO Validation
    ↓
Authentication
    ↓
Authorization
    ↓
Service
    ↓
Prisma
    ↓
Database
    ↓
Response
    ↓
Frontend
    ↓
UI
```

---

# 7. Swagger 測試

API 修改後，需要確認 Swagger：

- Endpoint 正確
    
- HTTP Method 正確
    
- Request Body 正確
    
- DTO 正確
    
- Required / Optional 正確
    
- Response 正確
    
- Authentication 正確
    
- Description 正確
    

Swagger 可以作為 API 文件，但不能取代實際 API 測試。

---

# 8. 測試結果

測試結果只能使用：

```text
PASS
FAIL
NOT TESTED
BLOCKED
```

不得將：

```text
FAIL
```

標記為：

```text
PASS
```

如果環境問題導致無法測試：

```text
Status: BLOCKED

Reason:
Database unavailable.
```

必須明確記錄原因。

---

# 9. 測試紀錄格式

每次 API 修改後，使用以下格式：

```md
## YYYY-MM-DD

### Commit

`COMMIT_HASH`

### 修改內容

- `GET /api/example`
- `POST /api/example`

### 受影響範圍

- Backend Controller
- DTO
- Service
- Frontend API Client

### Backend

- [ ] Request
- [ ] Validation
- [ ] Authentication
- [ ] Authorization
- [ ] Response
- [ ] Error handling
- [ ] Database

Result:

`PASS`

### Frontend

- [ ] Request
- [ ] Response handling
- [ ] Error handling
- [ ] UI integration

Result:

`PASS`

### Swagger

- [ ] Endpoint
- [ ] Request
- [ ] Response
- [ ] Description

Result:

`PASS`

### Final Result

`PASS`

### 備註

無
```

---

# 10. API Test Matrix

如果 API 數量增加，建議維護 API Test Matrix。

範例：

|API|Backend|Frontend|Swagger|Auth|最後測試|
|---|---|---|---|---|---|
|`POST /auth/login`|PASS|PASS|PASS|PASS|YYYY-MM-DD|
|`GET /users/me`|PASS|PASS|PASS|PASS|YYYY-MM-DD|
|`POST /users`|PASS|PASS|PASS|PASS|YYYY-MM-DD|

此表主要用於快速確認 API 是否有被驗證。

---

# 11. API 修改判斷

修改以下內容時，應重新測試相關 API：

### Controller

```text
重新測試相關 Endpoint
```

### DTO

```text
重新測試 Request Validation
```

### Service

```text
重新測試成功與錯誤流程
```

### Authentication

```text
重新測試：
- 未登入
- 已登入
- Token invalid
- Token expired
```

### Authorization

```text
重新測試：
- 有權限
- 無權限
```

### Database

```text
重新測試：
- Create
- Read
- Update
- Delete
```

視實際受影響 API 決定測試範圍。

---

# 12. 測試失敗處理

如果測試失敗：

1. 不得忽略。
    
2. 不得直接修改測試結果。
    
3. 找出原因。
    
4. 判斷是：
    
    - 程式錯誤
        
    - 測試錯誤
        
    - 環境問題
        
    - 文件錯誤
        
    - API Contract 問題
        
5. 修正後重新測試。
    
6. 更新最終測試結果。
    

---

# 13. Commit 前檢查

如果 Commit 包含 API 修改：

```text
[ ] 已確認受影響 API
[ ] Backend 已測試
[ ] Frontend 已測試
[ ] Swagger 已確認
[ ] DTO 已確認
[ ] Comment 已確認
[ ] Regression 已確認
[ ] 測試紀錄已更新
```

所有必要項目完成後才視為 API 修改完成。

---

# 14. AI 自動測試原則

AI Coder 可以協助：

- 判斷受影響 API
    
- 建立測試案例
    
- 執行 API
    
- 分析 Response
    
- 驗證 Swagger
    
- 驗證 Frontend integration
    
- 整理測試紀錄
    

但 AI Coder 不得虛構測試結果。

如果實際沒有執行：

```text
NOT TESTED
```

如果執行但因環境問題無法確認：

```text
BLOCKED
```

只有實際確認成功才能：

```text
PASS
```

---

# 15. 測試紀錄原則

測試紀錄的目標不是增加文件數量，而是讓未來可以回答：

> 「這個 API 最近一次什麼時候測過？」

> 「哪個 Commit 改過這個 API？」

> 「改完之後 Frontend 和 Backend 是否都有驗證？」

> 「目前這個 API 是否存在已知測試問題？」

因此紀錄必須保持簡潔、真實、可追蹤。

---

# 16. 最終原則

API 修改的完成條件：

```text
程式碼完成
    +
Swagger 完成
    +
DTO 文件完成
    +
必要 Comment 完成
    +
Backend 測試完成
    +
Frontend Integration 完成
    +
測試紀錄完成
```

以上條件完成後，才視為 API 修改完成。

---

# 17. 2026-09-30 Auth DTO 與 OpenAPI contract

- Commit：未建立
- 影響 API：`/api/auth/*`、`/api/users*`、`/api/roles*`
- Backend build：PASS（`pnpm.cmd --filter test_backend build`）
- Backend lint：PASS；仍有 4 個本次修改前已存在的 unused import warning
- DTO unit test：PASS（2 個 test files、6 個 tests）
- Swagger：PASS；以隔離的 3014 server 驗證所有已啟用 Auth 成功回應皆有 JSON schema，register 的 400／409 也有錯誤 envelope schema
- Frontend OpenAPI generation：PASS；已重新產生 `generatedFromBackend/schema.d.ts`
- Generated schema 單檔 typecheck：PASS
- Frontend 全專案 typecheck：FAIL；既有 `_drafts/privacy/page.tsx` 與 `Sidebar.tsx` 含 invalid character，與本次產生檔無關
- 實際 Auth HTTP／DB 流程：NOT TESTED；本次只啟動應用並讀取 `/openapi.json`，未建立或修改資料庫帳號

---

# 18. 2026-10-01 API 雙語回應訊息集中化

- Commit：未建立
- 影響 API：root、Auth、User、Role、UserRole、App、OAuthAccount、UserPassword、File、Notification；OAuth redirect route 不套 JSON envelope
- 原始碼覆蓋稽核：PASS；所有 JSON controller route 均使用 `ApiEnvelopeResponse`、`ResponseMessage` 或明確的通用 fallback，且 `messages.ts` 外無 API 雙語物件硬編碼
- Backend build：PASS（`pnpm.cmd --filter test_backend build`）
- Backend lint：PASS；仍有 4 個既有 unused import warning
- Backend unit test：PASS（3 個 test files、8 個 tests），包含成功訊息 metadata 與 fallback 行為
- Swagger／Frontend OpenAPI generation：NOT TESTED；本次沒有重新啟動 server 或覆寫現有前端產生檔
- 實際 HTTP／DB 流程：NOT TESTED；本次未呼叫會讀寫資料庫的 API

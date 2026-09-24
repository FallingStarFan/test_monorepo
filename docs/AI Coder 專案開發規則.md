# AI Coder 專案開發規則

> 本文件是 AI Coder 進入本專案後的主要開發指引。  
> AI Coder 在修改任何程式碼前，必須先閱讀本文件以及 `docs/` 中與此次任務相關的文件。

---

## 1. 核心原則

### 1.1 先理解，再修改

修改任何程式碼前，必須先理解：

- 目前專案架構
    
- 相關 Module 職責
    
- 現有 API 設計
    
- DTO
    
- Service
    
- Controller
    
- Database / Prisma
    
- 前後端資料流
    
- 既有文件與設計決策
    

不得在尚未理解現有架構的情況下直接重構或重新設計。

---

### 1.2 優先維持現有架構

除非有明確問題，否則：

- 不要任意重構
    
- 不要任意更換套件
    
- 不要任意改變 API
    
- 不要任意改變 Database Schema
    
- 不要任意增加 abstraction
    
- 不要建立沒有實際需求的設計模式
    
- 不要為了「未來可能會用到」而增加複雜度
    

修改應以：

> **最小必要修改完成需求**

為主要原則。

---

### 1.3 不要破壞既有功能

修改功能時：

- 不得無聲刪除既有 API
    
- 不得無聲修改 API contract
    
- 不得無聲改變 Response format
    
- 不得無聲改變 Authentication / Authorization 行為
    
- 不得無聲移除既有功能
    

如果確實需要 Breaking Change，必須先說明：

1. 原本行為
    
2. 新行為
    
3. 修改原因
    
4. 影響範圍
    
5. 前後端需要同步修改的地方
    

---

# 2. 文件規範

專案詳細架構與開發規範請參考：

```text
docs/architecture.md
```

API 測試規範與測試紀錄請參考：

```text
docs/api-testing.md
```

修改程式碼前，如果此次任務涉及上述內容，必須先閱讀對應文件。

若任務涉及既有錯誤類型、框架或第三方套件，先查閱 `docs/已知錯誤/` 的相符紀錄；
修正新類型的問題後，必須新增一份可避免重犯的紀錄。

每次 AI 實際修改專案檔案後，必須在 `docs/AI修改紀錄/` 新增一份精簡紀錄。
格式與必要欄位以 `docs/AI修改紀錄/README.md` 為準；架構或 API 變更仍要更新各自
的正式文件與測試紀錄。

---

# 3. API 開發規範

所有 API 必須保持：

```text
Controller
    ↓
DTO / Validation
    ↓
Service
    ↓
Prisma / Database
```

Controller 不應承擔大量 Business Logic。

Business Logic 應放在 Service 或適當的 Domain / Module 中。

---

## 3.1 DTO

所有 API Request DTO 必須：

- 使用適當的 Validation
    
- 清楚定義欄位
    
- 清楚定義必要 / 選填欄位
    
- 有 Swagger 說明
    
- 有必要的程式碼註解
    

DTO 不應只是為了 Swagger 而存在。

---

## 3.2 Swagger

所有對外 API 必須有完整 Swagger 文件。

至少需要讓使用者知道：

- API 用途
    
- HTTP Method
    
- Endpoint
    
- Request
    
- Request 欄位
    
- Validation
    
- Authentication
    
- Authorization
    
- Response
    
- Error Response
    

必要時使用：

```ts
@ApiOperation()
@ApiResponse()
@ApiOkResponse()
@ApiCreatedResponse()
@ApiBadRequestResponse()
@ApiUnauthorizedResponse()
@ApiForbiddenResponse()
@ApiNotFoundResponse()
@ApiBody()
@ApiParam()
@ApiQuery()
```

Swagger 的描述必須具有實際資訊，不得加入沒有意義的文字。

---

# 4. Comment 規範

程式碼需要適當 Comment，但不要求每一行都加註解。

需要 Comment 的情況包括：

- 複雜 Business Logic
    
- Authentication / Authorization
    
- Token / Session 處理
    
- Database 特殊處理
    
- 第三方 API
    
- 特殊 Workaround
    
- 不直覺的架構決策
    
- 容易被未來修改破壞的程式碼
    

Comment 優先說明：

> **為什麼這樣做**

而不是重複：

> **這段程式正在做什麼**

錯誤：

```ts
// Hash token
const tokenHash = hash(token);
```

較好的方式：

```ts
/**
 * 將 Session Token 雜湊後再儲存至資料庫，
 * 避免資料庫遭洩漏時可以直接取得有效 Session Token。
 */
const tokenHash = hash(token);
```

---

# 5. 前後端同步規範

修改 API 時，不得只確認 Backend。

必須確認：

```text
Frontend
   ↓
Request
   ↓
Backend Controller
   ↓
DTO Validation
   ↓
Service
   ↓
Database
   ↓
Response
   ↓
Frontend
```

如果 API Contract 有修改，需要同步檢查：

- Frontend API Client
    
- Type / DTO
    
- Request
    
- Response
    
- Error handling
    
- UI 使用位置
    

---

# 6. API 測試規範

只要 Commit 修改到 API 或可能影響 API 行為的程式碼，就必須重新測試受影響的 API。

可能影響 API 的修改包括：

- Controller
    
- DTO
    
- Validation
    
- Service
    
- Guard
    
- Authentication
    
- Authorization
    
- Middleware
    
- Prisma
    
- Database Schema
    
- API Response
    
- API Request
    
- 相關第三方服務
    

不需要因為完全無關的修改而重新測試全部 API。

---

## 6.1 API 修改流程

API 修改完成後：

```text
1. 找出受影響 API
2. 確認 Backend
3. 確認 Frontend
4. 確認 Swagger
5. 執行 API 測試
6. 確認測試結果
7. 更新 docs/api-testing.md
8. 確認沒有 Regression
9. 才完成 Commit
```

---

# 7. 測試紀錄

API 測試紀錄統一放在：

```text
docs/api-testing.md
```

每次 API 修改後，必須記錄：

- 日期
    
- Commit
    
- 修改 API
    
- Backend 測試
    
- Frontend 測試
    
- Swagger
    
- 測試結果
    
- 失敗原因
    
- 其他備註
    

如果因環境因素無法測試，不得標記為 PASS。

必須明確記錄：

```text
未測試
原因：...
```

---

# 8. AI Coder 工作流程

執行任務時遵循：

```text
閱讀文件
    ↓
理解架構
    ↓
確認需求
    ↓
找出影響範圍
    ↓
提出必要的架構變更
    ↓
修改程式碼
    ↓
更新 Swagger / DTO / Comment
    ↓
執
```

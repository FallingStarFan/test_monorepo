# Auth DTO 與 OpenAPI 型別產生規範

## 目的

本文件說明 Auth API 的 DTO 應如何建立，讓 Nest validation、Swagger 與前端
`openapi-typescript` 使用同一份 API contract。程式碼是最終來源；若文件與程式碼不一致，
先確認實際 controller、service 與回應 interceptor，再更新本文件。

## 主要入口

- Auth controller：`src/module/public-service/auth/*.controller.ts`
- Request／session DTO：`src/module/public-service/auth/dto/`
- 資料表子模組 DTO：`src/module/public-service/auth/tables/*/dto/`
- 統一成功／錯誤 envelope：`src/common/response/swagger-response.decorator.ts`
- Runtime 成功 envelope：`src/common/response/response.interceptor.ts`
- Runtime 錯誤 envelope：`src/common/response/filters/http-exception.filter.ts`
- Swagger 設定：`src/config/swagger.config.ts`
- 前端產物：`apps/frontend/src/lib/api/generatedFromBackend/schema.d.ts`

目前會註冊到 Nest／Swagger 的 Auth 範圍是：

- `AuthController`
- `AuthTokenController`
- `OAuthController`
- `UsersController`
- `UserRolesController`

`AppsController`、`RolesController`、`OauthAccountsController` 與
`UserPasswordsController` 目前未在各自 module 的 `controllers` 啟用。它們已有 DTO，
但在正式註冊前不會出現在 `/openapi.json`，也不能視為可用 API。

## Request DTO 規則

每一個 JSON body 或具名 query object 都使用 class DTO，不使用 controller 內的 inline type。
DTO 同時具備：

1. TypeScript 欄位型別與 required／optional 語意。
2. `class-validator` 驗證；全域 `ValidationPipe` 會移除未宣告欄位並拒絕額外欄位。
3. `@ApiProperty` 或 `@ApiPropertyOptional` 的說明、範例、format、enum 與限制。
4. 與 service 實際接受欄位一致的 contract。

使用 `PartialType`、`PickType` 或 `OmitType` 時，要再比對 service 的欄位讀取。
例如 `UsersService.update()` 會讀取 `emailVerified`、`roleIds` 與 `status`，所以
`UpdateUserDto` 必須包含這些選填欄位。`roleIds` 有傳入時完整取代角色，未傳入則不變。

不要在 optional request property 的 Swagger metadata 設定 `default`，除非伺服器真的會把
該欄位補進輸入或回應。`openapi-typescript` 可能把有 default 的 property 生成為必填；
資料庫預設值請寫在 description，讓前端仍得到正確的 optional 型別。

## Response DTO 與 envelope 規則

HTTP JSON 回應格式固定為：

```ts
{
  statusCode: number;
  message: { en: string; zh: string };
  data: T | null;
  code?: string;
  errors?: Array<{ field: string; code: string; message: string }>;
}
```

Controller 的 TypeScript return type與 shared interface 不會自動成為 runtime Swagger schema；
全域 interceptor 產生的 envelope 也無法被 Swagger 自動推導。因此：

- 成功回應使用 `@ApiEnvelopeResponse({ status, message, data, isArray? })`。
- 錯誤回應使用 `@ApiErrorEnvelopeResponse(status, message)`。
- `message` 必須引用 `MESSAGES`，不得在 controller 內建立新的 `{ en, zh }`。
- `data` 必須指向具體 class DTO，不能使用 interface、`object` 或未標註的匿名物件。
- 陣列回應使用 `isArray: true`，分頁則建立包含 `items`、`pagination` 的資料 DTO。
- 日期在 JSON／OpenAPI 一律是 `string` 並標示 `format: 'date-time'`。
- nullable 資料庫欄位使用 `T | null` 並標示 `nullable: true`。
- 不得把 password、password hash、JWT 或 refresh token 放進公開 response DTO。

範例：

```ts
@Post('login')
@ApiEnvelopeResponse({
  status: HttpStatus.OK,
  message: MESSAGES.AUTH_LOGIN_SUCCESS,
  data: AuthSessionDataDto,
})
@ApiErrorEnvelopeResponse(HttpStatus.UNAUTHORIZED, MESSAGES.INVALID_CREDENTIALS)
login(@Body() dto: PasswordLoginDto) {
  // 呼叫 service；runtime envelope 由 interceptor 處理。
}
```

## 修改流程

1. 先確認 controller 實際 request、service 回傳欄位與 Prisma select。
2. 修改或建立 request DTO，加入 validation 與 Swagger metadata。
3. 建立只包含公開欄位的 response data DTO。
4. 在每個 operation 標註成功與已知錯誤 envelope schema。
5. 執行 backend build、lint 與受影響測試。
6. 啟動 backend，直接檢查 `/openapi.json` 的 request／response `content.schema`。
7. 重新產生前端型別，確認 operation response 不再是 `Record<string, never>` 或 `content?: never`。
8. 更新本文件、API 測試紀錄與 AI 修改紀錄。

## 指令

由 monorepo 根目錄執行：

```bash
pnpm --filter test_backend build
pnpm --filter test_backend lint
pnpm --filter test_backend test
pnpm --filter test_backend start
pnpm --filter test_backend generate:api
```

`generate:api` 讀取 `http://localhost:3013/openapi.json`，所以必須先讓目前程式碼版本的
backend 在 3013 啟動。如果使用其他 port，可直接執行：

```bash
pnpm --filter test_backend exec openapi-typescript \
  http://localhost:3014/openapi.json \
  -o ../frontend/src/lib/api/generatedFromBackend/schema.d.ts
```

`schema.d.ts` 是產生檔，不直接手動修改。DTO 或 decorator 有問題時回到 backend 修正，
再重新產生。

## 完成判定

只有 build 通過不代表 Swagger contract 正確。至少確認：

- Request body／query 指向具體 DTO schema。
- 每個非導向型成功回應都有 `application/json` schema。
- `data` 指向正確 DTO 或 DTO array。
- optional、nullable、enum、UUID 與 date-time 沒有被誤判。
- 前端產生檔能看到具體欄位，且 frontend typecheck 通過。
- OAuth 302 導向端點不是 JSON API，不套用 JSON envelope DTO。

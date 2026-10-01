# API 回應訊息規範

## 目的

所有 JSON API 都回傳一致的雙語訊息，讓前端不需要自行翻譯後端結果，也避免相同情境在不同 controller 使用不同文字。訊息唯一來源是 `src/common/response/messages.ts`。

## 回應格式

成功與錯誤都使用 shared contract：

```ts
{
  statusCode: number;
  message: { en: string; zh: string };
  data: T | null;
  code?: string;
  errors?: Array<{ field: string; code: string; message: string }>;
}
```

`ResponseInterceptor` 負責成功 envelope，`HttpExceptionFilter` 負責錯誤 envelope。未指定成功訊息時會使用 `MESSAGES.OPERATION_SUCCESS`，但正式 endpoint 應選擇能描述操作結果的專用 key。

## 新增或修改 API

1. 先在 `MESSAGES` 搜尋語意相同的 key；不存在才依模組補上 `SCREAMING_SNAKE_CASE` key。
2. 使用 `@ApiEnvelopeResponse({ status, message: MESSAGES.KEY, data })` 的 endpoint，runtime 與 Swagger 會共用同一個訊息。
3. 尚未建立完整 envelope schema 的 endpoint，至少加上 `@ResponseMessage(MESSAGES.KEY)`。
4. 已知錯誤使用 `@ApiErrorEnvelopeResponse(status, MESSAGES.KEY)`，service／guard 則拋出 `new XxxException({ message: MESSAGES.KEY })`。
5. 不要在 controller、service 或 guard 直接寫 `{ en, zh }`，也不要只修改 Swagger description 而漏掉 runtime 訊息。
6. OAuth redirect、串流下載或直接操作 `@Res()` 的 route 不套 JSON envelope。

## 缺項處理

- 通用 HTTP 錯誤由 `HttpExceptionFilter` 的 status mapping 轉成 `MESSAGES`。
- 未預期例外只回傳 `MESSAGES.INTERNAL_SERVER_ERROR`，不可把內部錯誤細節送到前端。
- Validation 欄位錯誤可以是單語字串；外層 `message` 仍必須是雙語 `ApiMessage`。
- 新訊息要同時提供非空的 `en` 與 `zh`，並由 TypeScript 的 `as const` 保留 key 與內容型別。

## 驗證清單

- 搜尋 `src/`，確認除了 `messages.ts` 外沒有手寫 `en:`／`zh:` API 訊息。
- 測試 `ResponseInterceptor` 能讀取 handler／controller 的 message metadata，且無 metadata 時有安全 fallback。
- 執行 backend build、lint 與 test。
- API contract 有變更時，啟動目前版本 backend 後檢查 `/openapi.json`；需要前端型別時再重新執行 `generate:api`。

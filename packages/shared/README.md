# @test/shared

前後端共用的 TypeScript 型別與常數，是 monorepo 內「同一份定義」的唯一來源。

## 為什麼需要它

`apps/backend`（NestJS）與 `apps/frontend`（Next.js）各自維護一份型別時，
只要 Prisma Schema 或 API 回應格式調整，就會出現一邊改了、另一邊沒跟上的情況，
而且通常要到執行期才會發現。把型別與常數集中在這裡，可以在編譯期就發現落差。

## 目錄

```text
src/
├── index.ts              # 統一出口，使用端一律從套件根匯入
├── constants/
│   ├── api.ts            # API 前綴、Port、分頁、錯誤碼、HTTP 狀態碼
│   └── auth.ts           # 系統角色、OAuth Provider
└── types/
    ├── api.ts            # 統一回應 envelope、分頁
    ├── auth.ts           # User / Role / App / Session / OauthAccount
    ├── file.ts           # StoredFileMeta、presigned URL 請求與回應
    └── notification.ts   # 站內通知、Email 寄送紀錄
```

## 使用方式

```bash
pnpm --filter @test/shared build   # 產出 dist（型別與 ESM）
```

```ts
import { API_PREFIX, type ApiResponse, type User } from '@test/shared';
```

## 維護原則

- 型別必須與 `apps/backend/src/module/public-service/prisma/db/*.prisma` 保持一致。
- 常數若涉及後端實際行為（例如路由前綴、錯誤碼），調整後端時必須同步更新此處。
- 不放業務邏輯，只放型別與常數，避免這個套件變成難以維護的雜物包。

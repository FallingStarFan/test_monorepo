# Prisma 7 多 Schema 設定紀錄

## 為什麼這樣做

為了適應 PostgreSQL **多 Schema（Multi-Schema）** 架構，將不同功能的資料分開管理，例如：

```text
auth
drawer
booking
menu
```

同時讓 Prisma Schema 可以依功能拆成多個 `.prisma` 檔案，避免所有 Model 都集中在單一 `schema.prisma`。

## 目錄結構

```text
test_backend/
├── config/
│   └── env.ts
├── prisma/
│   ├── datasource.prisma
│   └── auth.prisma
├── prisma.config.ts
├── .env
└── src/
```

## Prisma Config

`prisma.config.ts` 負責指定 Prisma Schema 目錄與資料庫連線。

```ts
import { defineConfig } from "prisma/config";
import { env } from "./config/env.js";

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  schema: "./prisma",
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    url: env.databaseUrl,
  },
});
```

## Environment

集中管理環境變數：

`config/env.ts`

```ts
import "dotenv/config";

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
} as const;
```

使用：

```ts
env.databaseUrl
```

## Prisma Schema

`prisma/datasource.prisma`

```prisma
datasource db {
  provider = "postgresql"
  schemas  = ["auth"]
}
```

`prisma/auth.prisma`

放 Auth 相關的 Model / Enum，例如：

```text
User
UserPassword
OauthAccount
Session
UserRole
UserStatus
```

未來可以依功能增加：

```text
prisma/
├── datasource.prisma
├── auth.prisma
├── drawer.prisma
├── booking.prisma
└── menu.prisma
```

## 常用指令

常用開發流程
修改資料結構
pnpm prisma validate
pnpm prisma migrate dev --name add_xxx
只需要重新產生 Client
pnpm prisma generate
想查看資料
pnpm prisma studio
簡單記憶
validate → 檢查 Schema
migrate  → 更新資料庫結構
generate → 更新 Prisma Client
studio   → 查看 / 操作資料


pnpm prisma migrate reset   如果刪除migration 紀錄


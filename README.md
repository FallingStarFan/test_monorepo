# test_monorepo

NestJS 後端與 Next.js 前端共用的 pnpm workspace monorepo。

## 為什麼採用 monorepo

前後端需要共用同一組 API 型別與常數（錯誤碼、路由前綴、分頁上限）。
若兩端各自宣告，只要有一邊調整，另一邊就會出現難以定位的 404 或判斷失準；
集中在 `packages/shared` 定義後，型別不一致會在編譯階段就被發現。

## 目錄結構

| 路徑 | 說明 |
| --- | --- |
| `apps/backend` | NestJS API（原始 `test_backend` 的副本，原始專案保持不動） |
| `apps/frontend` | Next.js（App Router）+ TypeScript + Tailwind CSS + shadcn/ui |
| `packages/shared` | `@test/shared`：前後端共用的 TypeScript 型別與常數 |

## 快速開始

依賴統一在 repo 根目錄安裝一次，子專案不需要各自安裝。

```bash
pnpm install          # 安裝全部 workspace 依賴
pnpm -r build         # 依拓撲順序建置（shared → backend / frontend）
pnpm --filter @test/frontend dev        # 前端開發伺服器（http://localhost:3000）
pnpm --filter test_backend start:debug  # 後端開發伺服器（watch 模式，http://localhost:3013）
```

`@test/shared` 發佈的是編譯產物，修改 shared 後需重新建置才能被前端取用：

```bash
pnpm --filter @test/shared build
```

## 開發約定

- 註解與文件一律使用繁體中文，註解說明「為什麼」採用此做法，而非描述程式碼行為。
- 遵循最小必要修改原則：先理解現有實作，再進行改動。
- 後端與前端各模組的對應關係需保持完整：每個後端模組都應有對應的前端頁面
  （對照表維護於前端總覽頁 `apps/frontend/src/app/page.tsx`）。
- 測試結果一律使用 PASS / FAIL / NOT TESTED / BLOCKED 描述。
- 後端專案規範與修改紀錄位於 `apps/backend/docs`（含 AI 修改紀錄與 git 紀錄檔存放區）。

## 目前進度

- 第一批：monorepo 骨架、`packages/shared`、前端骨架與全域 UI 縮放（已完成）。
- 後續批次：public-service 的 permission 與 billing 模組、`apps/canvas` 白板、
  API 自動測試（vitest + supertest）與 Playwright 端到端測試。

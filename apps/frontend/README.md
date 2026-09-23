# apps/frontend

Next.js（App Router）+ TypeScript + Tailwind CSS + shadcn/ui 前端。

## 指令

於 monorepo 根目錄執行（依賴由根目錄一次安裝）：

```bash
pnpm --filter @test/frontend dev        # 開發伺服器（預設 http://localhost:3000）
pnpm --filter @test/frontend build      # 正式建置
pnpm --filter @test/frontend typecheck  # 型別檢查
```

`@test/shared` 為 TypeScript 專案，前端引用的是其編譯產物，
因此在首次啟動或修改 shared 之後，需先建置共用套件：

```bash
pnpm --filter @test/shared build
```

## 目錄結構

| 路徑 | 用途 |
| --- | --- |
| `src/app` | App Router 路由；每個後端模組對應一個資料夾 |
| `src/components/ui` | shadcn/ui 基礎元件（在此調整樣式，不散落於各頁面） |
| `src/components/layout` | 版面骨架：側邊欄、頁首、主題與縮放控制 |
| `src/components/providers` | 全域狀態：主題、UI 縮放 |
| `src/lib` | 共用工具與導覽設定 |

## 慣例

- 註解一律繁體中文，並說明「為什麼」採用此做法，而非描述程式碼在做什麼。
- 新增頁面時，同時更新 `src/lib/navigation.ts`，讓導覽與頁首標題自動同步。
- 版面尺寸使用 rem（例如 Tailwind 的 `spacing.sidebar`），以支援全域 UI 縮放。
- 不使用 CSS `transform: scale()` 做整體縮放，因會破壞固定定位與文字清晰度。
- 依需求規範，不建立 drawer 相關元件或樣式。

# 專案文件

歡迎來到 Test Frontend 專案！這個文件資料夾包含關於專案的所有重要資訊。

## 專案結構

```
test_frontend/
├── app/                 # Next.js App Router 檔案
├── components/          # 共用元件
├── lib/                 # 工具函數和邏輯
├── public/              # 靜態資源
├── styles/              # CSS 樣式檔案
├── docs/                # 這個文件資料夾
├── package.json         # 專案設定和依賴
├── next.config.ts       # Next.js 設定
├── tsconfig.json        # TypeScript 設定
└── README.md            # 此文件
```

## 技術堆疊

- **框架**: Next.js 16.3.5 (React 19)
- **樣式**: Tailwind CSS 4
- **型別檢查**: TypeScript 5
- **Linting**: ESLint 9
- **狀態管理**: React Query 5
- **圖形元件**: Excalidraw, Tabler Icons

## 開發環境設定

### 安裝依賴

```bash
pnpm install
```

### 開始開發

```bash
pnpm dev
```

### 建置專案

```bash
pnpm build
```

### 啟動生產環境

```bash
pnpm start
```

## 開發規範

1. 使用 TypeScript 進行型別檢查
2. 遵循 ESLint 規範
3. 使用 Tailwind CSS 進行樣式設計
4. 元件化開發，保持程式碼重用性
5. 使用 React Server Components (Next.js App Router)
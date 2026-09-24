# 專案架構

## 整體架構

本專案採用 Next.js App Router 架構，使用 React 19 和 TypeScript 5。整個應用程式以模組化方式組織，便於維護和擴展。

## 目錄結構說明

### `/app`
Next.js App Router 的主要目錄，包含所有頁面、路由和伺服器元件。

### `/components`
共用元件目錄，分為：
- `ui/` - UI 元件
- `layout/` - 頁面布局元件
- `shared/` - 共用元件

### `/lib`
應用程式邏輯和工具函數：
- API 服務
- 工具函數
- 自訂 Hook

### `/public`
靜態資源目錄，包含圖片、圖示等。

### `/styles`
全域樣式檔案。

## 技術選型理由

### Next.js
- 提供 SSR、SSG、ISR 等功能
- 原生支援 React Server Components
- 內建路由系統

### React 19
- 支援新的 React API
- 更好的效能和開發體驗

### TypeScript
- 增強程式碼可讀性和可維護性
- 提供早期錯誤檢查

### Tailwind CSS
- 快速原型設計
- 統一的樣式管理
- 高度可自訂

### React Query
- 狀態管理
- API 請求處理
- 自動重新整理和快取
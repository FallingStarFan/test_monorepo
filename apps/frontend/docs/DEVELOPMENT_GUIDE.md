# 開發指南

## 環境設定

### 必需工具
- Node.js (版本 18+)
- pnpm (包管理器)
- Git

### 安裝步驟

1. 克隆專案
```bash
git clone <repository-url>
```

2. 安裝依賴
```bash
pnpm install
```

3. 啟動開發伺服器
```bash
pnpm dev
```

## 開發流程

### 新增頁面
1. 在 `/app` 目錄下建立新的路由目錄
2. 建立 `page.tsx` 檔案
3. 實作頁面元件

### 新增元件
1. 在 `/components` 目錄下建立適當的子目錄
2. 建立元件檔案 (e.g., `MyComponent.tsx`)
3. 實作元件邏輯並導出

### API 請求
使用 React Query 管理 API 請求：

```typescript
import { useQuery } from '@tanstack/react-query';

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['data'],
    queryFn: () => fetch('/api/data').then(res => res.json())
  });
  
  return <div>{isLoading ? '載入中...' : JSON.stringify(data)}</div>;
}
```

## 程式碼規範

### 檔案命名
- 使用 kebab-case 命名目錄和檔案
- 元件檔案使用 PascalCase
- 例如：`components/UserProfile/UserCard.tsx`

### 組件結構
```typescript
// 正確的組件結構
import React from 'react';

interface Props {
  name: string;
}

const MyComponent: React.FC<Props> = ({ name }) => {
  return (
    <div>
      <h1>Hello {name}</h1>
    </div>
  );
};

export default MyComponent;
```

### TypeScript 使用
- 儘可能使用型別定義
- 避免使用 `any` 型別
- 使用 interface 定義 props

## 測試

### 組件測試
使用 React Testing Library 或 Jest 進行測試。

### 端對端測試
使用 Cypress 或 Playwright。

## 語言規範

### 中文註解
- 所有程式碼註解使用中文
- 變數命名使用英文，但註解說明使用中文

### 文件撰寫
- 開發文件使用繁體中文
- API 文件使用英文

## 常見問題

### 伺服器啟動失敗
確認 Node.js 版本是否正確，並重新安裝依賴。

### 編譯錯誤
檢查 TypeScript 設定和程式碼型別。
# 程式碼規範

## TypeScript 規範

### 型別定義
- 使用 interface 定義物件型別
- 使用 type 定義聯合型別或複雜型別
- 避免使用 any，盡量使用泛型

```typescript
// 好的寫法
interface User {
  id: number;
  name: string;
  email: string;
}

type UserRole = 'admin' | 'user' | 'guest';

// 不好的寫法
const user: any = { id: 1, name: 'John' };
```

### 函數定義
- 使用箭頭函數進行簡潔定義
- 為所有函數提供明確的型別定義

```typescript
// 好的寫法
const add = (a: number, b: number): number => a + b;

// 不好的寫法
const add = (a, b) => a + b; // 缺少型別定義
```

## 組件開發規範

### 元件結構
- 使用 React.FC 作為元件類型定義
- 使用 props interface 定義屬性
- 預設匯出元件

```typescript
import React from 'react';

interface ButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  text, 
  onClick, 
  disabled = false 
}) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {text}
    </button>
  );
};

export default Button;
```

### 組件命名
- 使用 PascalCase 命名元件
- 名稱應清楚描述元件功能

## 樣式規範

### Tailwind CSS
- 使用語意化的 class 名稱
- 避免內嵌樣式
- 重複使用的樣式應抽象成元件或 class

```html
<!-- 好的寫法 -->
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  按鈕
</button>

<!-- 不好的寫法 -->
<button style="padding: 1rem; background-color: blue; color: white;">
  按鈕
</button>
```

## 狀態管理

### React Query
- 使用 queryKey 作為查詢的唯一識別
- 正確處理 loading、error 和 success 狀態
- 合理設定快取時間

```typescript
const { data, isLoading, isError } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5分鐘
});
```

## 網路請求

### API 請求處理
- 使用 React Query 或自訂 Hook 管理 API 請求
- 正確處理錯誤和載入狀態
- 避免在組件中直接處理 HTTP 請求

```typescript
// 好的寫法
const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json())
  });
};

// 不好的寫法
function Component() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);
}
```

## Git 提交規範

### 提交訊息格式
- 使用英文撰寫提交訊息
- 使用動詞開頭 (add, fix, update, remove)
- 結構化提交訊息

```
feat: 新增使用者登入功能
fix: 修復搜尋功能的錯誤
docs: 更新 API 文件
style: 格式化樣式檔案
refactor: 重構導航組件
test: 增加測試用例
```

## 維護規範

### 程式碼審查
- 所有變更需通過程式碼審查
- 檢查型別安全性
- 確保效能和可讀性

### 文件維護
- 新增功能時同步更新文件
- 保持文件與程式碼一致
- 使用清晰明瞭的語言
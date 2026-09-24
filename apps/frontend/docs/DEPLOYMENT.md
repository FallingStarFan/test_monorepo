# 部署說明

## 本地開發環境

### 環境變數
在開發環境中，使用 `.env.local` 檔案設定環境變數。

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 啟動伺服器
```bash
# 開始開發伺服器
pnpm dev

# 建置專案
pnpm build

# 啟動生產環境
pnpm start
```

## 生產環境部署

### Vercel 部署
本專案已設定為支援 Vercel 部署：

1. 將專案推送到 Git 仓库
2. 連結到 Vercel 帳號
3. Vercel 會自動建置和部署

### 自行部署
如需在自己的伺服器上部署：

```bash
# 1. 建置專案
pnpm build

# 2. 建立靜態檔案
pnpm export

# 3. 部署到伺服器
# 將 .next 目錄和 public 目錄部署到伺服器
```

## Docker 部署

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

## 環境變數設定

### 必需環境變數
- `NEXT_PUBLIC_API_URL` - API 伺服器 URL
- `NEXT_PUBLIC_APP_NAME` - 應用程式名稱

### 生產環境變數
- `DATABASE_URL` - 資料庫連接字串
- `JWT_SECRET` - JWT 密鑰

## 監控和日誌

### 異常處理
- 使用錯誤邊界元件處理組件錯誤
- 記錄重要的應用程式錯誤
- 集中處理未捕獲的例外

### 性能監控
- 使用 Next.js 內建的效能分析工具
- 監控頁面載入時間
- 監控 API 請求延遲

## 最佳實踐

### 安全性
- 定期更新依賴套件
- 避免在前端暴露敏感資訊
- 使用 HTTPS
- 實施 CORS 策略

### 可用性
- 提供錯誤頁面
- 處理網路中斷情況
- 提供載入狀態指示器
- 優化首頁載入時間

### 可維護性
- 保持程式碼簡潔易懂
- 定期清理無用檔案
- 維護文件更新
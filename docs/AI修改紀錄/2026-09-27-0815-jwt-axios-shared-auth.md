# JWT、Axios 與 shared Auth 完整改造

- 日期：2026-09-27 08:15（Asia/Taipei）
- 任務：整理共用 API 契約、移除純代理 BFF、統一 Axios，並補齊 JWT access/refresh、Session、OAuth、Cookie、CORS 與環境設定。

## 修改

- `packages/shared/src`：移除 DB-shaped auth 型別與未用常數，保留 JSON API envelope、Auth/File 等實際傳輸契約。
- `apps/backend/src/config`、`apps/backend/src/main.ts`：集中驗證環境變數與 Cookie 選項，加入精確 CORS、Origin CSRF 檢查與統一成功/錯誤 envelope。
- `apps/backend/src/module/public-service/auth`：整合帳密登入、OAuth state、`/me`、登出、JWT refresh 輪替、Session 雜湊/到期/撤銷與重放防護。
- `apps/frontend/src/lib/api`、session provider 與呼叫端：統一 Axios client、並發 401 refresh、直接呼叫 NestJS，刪除純代理 route handler。
- `.env.example` 與本機忽略的 `.env`：統一前後端 URL、Cookie、JWT、CORS 與 OAuth callback 變數。

## 影響

- API：登入、refresh 與登出回傳 200，註冊回傳 201；所有非 redirect 回應使用 `{ statusCode, message, data }`。
- Database：沿用既有 `Session` 欄位，無 schema 變更、無新增 migration、未 reset 資料庫。
- Authentication：每次登入為獨立裝置 Session；登出或 refresh 重放會立即使該 Session 的 access/refresh 能力失效，不影響其他裝置。
- 相容性：舊 `NEXT_PUBLIC_API_BASE_URL`、`WEB_ORIGIN`、`API_ORIGIN` 與 `/api/auth/session` BFF 已移除。

## 驗證

- `pnpm.cmd --dir packages/shared run build`：PASS。
- `pnpm.cmd --dir apps/backend run public-service:validate`：PASS。
- `pnpm.cmd --dir apps/backend run public-service:generate`：PASS。
- `pnpm.cmd --dir apps/backend run test`：PASS（3 files / 7 tests）。
- `pnpm.cmd --dir apps/backend run build`：PASS。
- 實際 HTTP Auth、Cookie、重放撤銷、CORS 與 CSRF 流程：PASS；測試帳號已刪除。
- 完整 frontend typecheck/build：FAIL（既有兩個檔案含非法字元，非本次修改）；本次受影響檔案 TypeScript 驗證 PASS。
- 真實 Google / GitHub OAuth：NOT TESTED（缺少外部 provider 憑證與控制台 callback 設定）。

/**
 * Next.js 設定。
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // 開發階段就以 StrictMode 執行，讓不安全的副作用（例如重複訂閱）
  // 在開發時就浮現，而不是等上線後才造成難以重現的錯誤。
  reactStrictMode: true,

  eslint: {
    // Next 內建的 lint 只認得單一專案的設定，這裡改用根目錄統一的檢查流程，
    // 避免 monorepo 內出現兩套不一致的規則而讓 build 結果不穩定。
    ignoreDuringBuilds: true,
  },

  typedRoutes: false,
};

export default nextConfig;

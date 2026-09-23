/**
 * PostCSS 設定。
 *
 * Tailwind 必須透過 PostCSS 執行；Next.js 會自動讀取此檔，
 * 因此不需要在 next.config 內額外註冊。
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

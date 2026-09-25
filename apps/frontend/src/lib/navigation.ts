import {
  Bell,
  FileText,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from 'lucide-react';

/**
 * 全站導覽設定。
 *
 * 集中定義可讓側邊欄、行動版導覽與頁面標題共用同一份資料；
 * 若各處自行列出項目，新增模組頁面時很容易只改到其中一處。
 *
 * 這裡只列出已經有實際頁面的模組，後端新增模組並補上頁面後再於此加入，
 * 以免導覽出現點了會 404 的項目。
 */
export interface NavItem {
  /** 前端路徑。 */
  href: string;
  /** 選單顯示名稱。 */
  label: string;
  /** 選單說明，同時作為頁面副標題。 */
  description: string;
  /** 對應的圖示。 */
  icon: LucideIcon;
  /**
   * 是否僅限 public-service 的 ADMIN 可見。
   *
   * 這是「畫面要不要顯示」的設定，不是授權判斷：
   * 真正的存取控制一律由後端 Guard 負責，這裡只是避免非 ADMIN
   * 看到入口、點進去才被拒絕。
   */
  requiresAdmin?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: '多專案入口',
    description: '',
    icon: LayoutDashboard,
    requiresAdmin: true,
  },
 
  {
    href: '/settings',
    label: '設定',
    description: '介面偏好、顯示縮放與主題',
    icon: Settings,
  },
];

/**
 * 依登入狀態過濾出可見的導覽項目。
 *
 * 集中在此處過濾，桌面側欄與行動版面板才會共用同一份判斷；
 * 之後若要新增其他 ADMIN 專屬頁面，只要在 NAV_ITEMS 標記即可。
 */
export function visibleNavItems(isAdmin: boolean): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.requiresAdmin || isAdmin);
}

/**
 * 依目前路徑找出對應的導覽項目。
 *
 * 根路徑必須精確比對，否則所有路徑都會被 "/" 的前綴命中。
 */
export function findNavItem(pathname: string): NavItem | undefined {
  if (pathname === '/') {
    return NAV_ITEMS.find((item) => item.href === '/');
  }

  return NAV_ITEMS.find(
    (item) => item.href !== '/' && pathname.startsWith(item.href),
  );
}

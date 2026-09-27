/**
 * 頁面路由定義
 */
export enum PageRoutes {
  HOME = '/',
  EXCALIDRAW = '/excalidraw',
  PAGE2 = '/page2',
  PAGE3 = '/page3',
}

/**
 * 頁面資訊定義（包含更多欄位）
 */
export interface PageItem {
  /** 路由路徑 */
  path: string;
  
  /** 頁面名稱 */
  name: string;
  
  /** 圖示 */
  icon: string;
  
  /** 是否為導覽列顯示的頁面 */
  showInNav?: boolean;
  
  /** 頁面標題 */
  title?: string;
  
  /** 頁面描述 */
  description?: string;
}

/**
 * 所有頁面的詳細資訊
 */
export const PageItems: Record<PageRoutes, PageItem> = {
  [PageRoutes.HOME]: {
    path: PageRoutes.HOME,
    name: '首頁',
    icon: '🏠',
    showInNav: true,
    title: '首頁',
    description: '測試前端應用程式的首頁'
  },
  [PageRoutes.EXCALIDRAW]: {
    path: PageRoutes.EXCALIDRAW,
    name: 'Excalidraw',
    icon: '✏️',
    showInNav: true,
    title: 'Excalidraw 繪圖',
    description: '使用 Excalidraw 繪製和分享你的創意'
  },
  [PageRoutes.PAGE2]: {
    path: PageRoutes.PAGE2,
    name: '功能 2',
    icon: '⚙️',
    showInNav: true,
    title: '功能 2',
    description: '第二個功能頁面'
  },
  [PageRoutes.PAGE3]: {
    path: PageRoutes.PAGE3,
    name: '功能 3',
    icon: '📊',
    showInNav: true,
    title: '功能 3',
    description: '第三個功能頁面'
  }
};
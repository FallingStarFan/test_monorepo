import { Injectable } from '@nestjs/common';

import env from '@/config/env.js';

import { API_PREFIX } from '@test/shared';

const DASHBOARD_MODULE_STATUS = {
  DONE: '骨架完成',
  TODO: '待辦',
} as const;

type DashboardModuleCoverage = {
  backend: string;
  frontend: string;
  status: (typeof DASHBOARD_MODULE_STATUS)[keyof typeof DASHBOARD_MODULE_STATUS];
};

/**
 * 模組覆蓋清單。
 *
 * 為什麼維護在後端而不是前端頁面裡：
 * 這份清單描述的是「後端有哪些模組、分別有沒有對應的前端頁面」，
 * 判斷依據來自後端的模組結構。放在前端頁面會變成「後端新增模組後，
 * 要記得去前端改一份寫死的清單」，久而久之兩邊就會不一致；
 * 由後端提供，前端只負責顯示，新增模組時就只需要改動一處。
 */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

const MODULE_COVERAGE: readonly DashboardModuleCoverage[] = [
  {
    backend: 'public-service / auth',
    frontend: '尚未建立（登入流程頁面待後續批次）',
    status: DASHBOARD_MODULE_STATUS.TODO,
  },
  {
    backend: 'public-service / file',
    frontend: '/files',
    status: DASHBOARD_MODULE_STATUS.DONE,
  },
  {
    backend: 'public-service / notification',
    frontend: '/notifications',
    status: DASHBOARD_MODULE_STATUS.DONE,
  },
  {
    backend: 'public-service / permission（規劃中）',
    frontend: '尚未建立',
    status: DASHBOARD_MODULE_STATUS.TODO,
  },
  {
    backend: 'public-service / billing（規劃中）',
    frontend: '尚未建立',
    status: DASHBOARD_MODULE_STATUS.TODO,
  },
];

/**
 * 總覽頁資料服務。
 *
 * 為什麼需要一個 Service 而不是在 Controller 裡直接組資料：
 * API 前綴與回應契約來自 @test/shared，部署位址與連接埠則由集中式
 * 環境設定提供；組裝邏輯集中在一處，才有單一來源可以對照與測試；
 * Controller 只負責授權宣告與回應，職責不混在一起。
 */
@Injectable()
export class DashboardOverviewService {
  /**
   * 取得總覽資料。
   *
   * 為什麼回傳值裡沒有「使用者」或「權限」相關欄位：
   * 授權由 Controller 的 Guard 負責，能走到這裡就代表已通過
   * 「ADMIN 角色 + app:read 權限碼」的檢查；把授權結果混進資料內容
   * 會讓「資料」與「授權」兩個概念糾纏，之後改權限規則時容易誤改資料形狀。
   */
  getOverview() {
    return {
      generatedAt: new Date().toISOString(),
      endpoints: {
        // 實際部署位址來自集中驗證過的 FRONTEND_URL / BACKEND_URL；
        // CORS_ORIGINS 僅負責列出允許攜帶 Cookie 呼叫 API 的精確來源。
        apiBaseUrl: `${env.backendUrl}${API_PREFIX}`,
        apiPrefix: API_PREFIX,
        apiPort: env.serverPort,
        webOrigin: env.frontendUrl,
        webPort: Number(
          new URL(env.frontendUrl).port ||
            (env.frontendUrl.startsWith('https:') ? 443 : 80),
        ),
        sharedPackageName: '@test/shared',
        sharedPackagePurpose: '型別、常數',
        pagination: {
          defaultPage: PAGINATION.DEFAULT_PAGE,
          defaultPageSize: PAGINATION.DEFAULT_PAGE_SIZE,
          maxPageSize: PAGINATION.MAX_PAGE_SIZE,
        },
      },
      // 回傳複本而不是直接回傳常數陣列：呼叫端若不小心改到內容，
      // 下一個請求就會拿到被改過的資料，這種錯誤極難追查。
      modules: MODULE_COVERAGE.map((module) => ({
        ...module,
      })),
    };
  }
}

import { Injectable } from '@nestjs/common';

import {
  API_PREFIX,
  DASHBOARD_MODULE_STATUS,
  DEFAULT_API_PORT,
  DEFAULT_WEB_PORT,
  PAGINATION,
  type DashboardModuleCoverage,
  type DashboardOverview,
} from '@test/shared';

/**
 * 模組覆蓋清單。
 *
 * 為什麼維護在後端而不是前端頁面裡：
 * 這份清單描述的是「後端有哪些模組、分別有沒有對應的前端頁面」，
 * 判斷依據來自後端的模組結構。放在前端頁面會變成「後端新增模組後，
 * 要記得去前端改一份寫死的清單」，久而久之兩邊就會不一致；
 * 由後端提供，前端只負責顯示，新增模組時就只需要改動一處。
 */
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
 * 這些數值全部來自 @test/shared 的常數（Port、前綴、分頁預設值），
 * 組裝邏輯集中在一處，才有單一來源可以對照與測試；
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
  getOverview(): DashboardOverview {
    return {
      generatedAt: new Date().toISOString(),
      endpoints: {
        // 位址一律由共用常數組出，不從 .env 的 WEB_ORIGIN 讀取：
        // WEB_ORIGIN 是後端 CORS 的白名單設定，語意是「允許哪個來源呼叫我」，
        // 與「前端實際網址是什麼」是兩件事，拿來當顯示資料會讓兩者互相牽制。
        apiBaseUrl: `http://localhost:${DEFAULT_API_PORT}${API_PREFIX}`,
        apiPrefix: API_PREFIX,
        apiPort: DEFAULT_API_PORT,
        webOrigin: `http://localhost:${DEFAULT_WEB_PORT}`,
        webPort: DEFAULT_WEB_PORT,
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

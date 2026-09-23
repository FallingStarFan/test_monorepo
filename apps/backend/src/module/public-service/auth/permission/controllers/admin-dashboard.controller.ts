import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { DashboardOverviewService } from '../dashboard-overview.service.js';
import { RequirePermission, RequireRole } from '../decorators/permission.decorators.js';
import { PermissionGuard } from '../guards/permission.guard.js';
import {
  ADMIN_ROLE_NAME,
  PERMISSION_CODES,
} from '../permission.constants.js';

/**
 * 總覽頁資料 API。
 *
 * 為什麼要新增這個端點，而不是讓前端自行組出總覽內容：
 * 總覽頁原本把自己的 API 位址、前端網址、共用套件、分頁預設值與模組覆蓋狀態
 * 全部寫死在頁面程式碼裡，這些其實都是後端／共用套件才知道的事實。
 * 改由後端提供後，前端只負責顯示；同時這個端點掛在既有的權限 Guard 之下，
 * 讓「總覽資料」本身也成為需要 ADMIN 權限才能取得的受保護資源。
 *
 * 授權沿用既有機制與既有權限碼：
 * - Guard 鏈：AuthenticatedGuard → PermissionGuard（未登入 401、
 *   無 public-service 角色 403 NO_APP_ROLE、缺權限碼 403 PERMISSION_DENIED）
 * - 角色：public-service 的 ADMIN（@RequireRole(ADMIN_ROLE_NAME)）
 * - 權限碼：app:read（seed 只把權限碼指派給 public-service 的 ADMIN，
 *   因此這個權限碼就是「僅 ADMIN 具備」的既有權限碼，未新增任何權限碼）
 */
@ApiTags('Permission Admin')
@ApiBearerAuth('access-token')
@UseGuards(PermissionGuard)
@RequireRole(ADMIN_ROLE_NAME)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(
    private readonly dashboardOverviewService: DashboardOverviewService,
  ) {}

  @Get('overview')
  @RequirePermission(PERMISSION_CODES.APP_READ)
  @ApiOperation({
    summary: 'Get dashboard overview / 取得總覽頁資料',
    description: `
Get the data shown on the dashboard overview page.

取得總覽頁（/）顯示的資料：後端 API 位址、前端網址、共用套件、
分頁預設值與模組覆蓋狀態。需具備 public-service 的 ADMIN 角色
與 app:read 權限碼。
`,
  })
  @ApiResponse({
    status: 200,
    description: '成功回傳總覽資料。',
  })
  @ApiResponse({
    status: 401,
    description: '未登入或 Access Token 無效。',
  })
  @ApiResponse({
    status: 403,
    description:
      'code = NO_APP_ROLE（沒有 public-service 角色）或 code = PERMISSION_DENIED（角色或權限不足）。',
  })
  getOverview() {
    return this.dashboardOverviewService.getOverview();
  }
}

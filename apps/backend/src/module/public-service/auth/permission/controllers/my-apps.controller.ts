import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthenticatedGuard } from '../guards/authenticated.guard.js';
import type { AuthenticatedRequest } from '../guards/authenticated.guard.js';
import { MyAppsService } from '../my-apps.service.js';

/**
 * App 入口清單 API。
 *
 * 為什麼路由是 /apps/mine：
 * mounted 在 /admin 之下的 /admin/apps 是「管理用」的完整清單（需要 ADMIN 與 app:read），
 * 而入口頁需要的是「我自己可以進入的 App」，兩者語意不同、權限也不同。
 * 另外既有 auth 模組的 GET /apps 是未受保護的公開端點，
 * 這裡用 /apps/mine 明確區隔，避免與它或未來的 /apps/:id 產生路由衝突。
 *
 * 為什麼只要求登入、不要求任何角色或權限碼：
 * 「我有哪些 App 可以進入」是任何登入者都必須能取得的基本資訊；
 * 若套用 PermissionGuard，尚未被指派角色的人會拿到 403，
 * 入口頁就無法區分「你還沒有任何 App」與「系統錯誤」。
 */
@ApiTags('App')
@ApiBearerAuth('access-token')
@UseGuards(AuthenticatedGuard)
@Controller('apps')
export class MyAppsController {
  constructor(
    private readonly myAppsService: MyAppsService,
  ) {}

  @Get('mine')
  @ApiOperation({
    summary: 'Get my apps / 取得登入者可進入的 App 清單',
    description: `
Get the apps the current user can enter.

回傳目前登入者可以進入的 App 清單（入口頁卡片資料）。
資料來源為資料庫 apps 表加上登入者的角色：有角色的 App 會出現，
控制台則在登入者具備 public-service 的 ADMIN 角色時出現。
沒有任何 App 可進入時回傳空陣列而不是 403。
`,
  })
  @ApiResponse({
    status: 200,
    description:
      '成功回傳 App 清單（可能為空陣列）與 isAdmin 旗標。',
  })
  @ApiResponse({
    status: 401,
    description: '未登入或 Access Token 無效。',
  })
  findMine(@Req() request: AuthenticatedRequest) {
    // AuthenticatedGuard 已驗證 Token 並把 userId 放進 request，
    // 這裡直接沿用，不必再解析一次 Cookie 或標頭。
    return this.myAppsService.findMyApps(
      request.currentUserId as string,
    );
  }
}

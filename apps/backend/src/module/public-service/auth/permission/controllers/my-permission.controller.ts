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
import { PermissionService } from '../permission.service.js';

/**
 * 目前登入者自己的權限查詢 API。
 *
 * 為什麼這個端點只要求登入、不要求 ADMIN：
 * 前端需要用「我有哪些權限」來決定選單與按鈕是否顯示，
 * 這是任何登入者都必須能取得的基本資訊。若這裡也套用 PermissionGuard，
 * 沒有角色的人會拿到 403，前端就無法區分「尚未被指派角色」與「系統錯誤」，
 * 只能顯示空白畫面或誤導性的錯誤訊息。
 */
@ApiTags('Permission')
@ApiBearerAuth('access-token')
@UseGuards(AuthenticatedGuard)
@Controller('permissions')
export class MyPermissionController {
  constructor(
    private readonly permissionService: PermissionService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary:
      'Get my permissions / 取得目前使用者的角色與權限',
    description:
      '回傳目前登入者在 public-service 的角色名稱與權限碼清單（供前端控制 UI 顯示）；沒有角色時回傳空清單而不是 403。',
  })
  @ApiResponse({
    status: 200,
    description: '成功回傳角色與權限清單。',
  })
  @ApiResponse({
    status: 401,
    description: '未登入或 Access Token 無效。',
  })
  me(@Req() request: AuthenticatedRequest) {
    // AuthenticatedGuard 已經驗證過 Token 並把 userId 放進 request，
    // 這裡直接沿用，不必再解析一次 Cookie。
    return this.permissionService.findUserAppAccess(
      request.currentUserId as string,
    );
  }
}

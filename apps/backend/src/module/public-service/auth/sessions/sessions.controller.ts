import { Controller, Delete, Get, Param, ParseUUIDPipe } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { SessionService } from './sessions.service.js';

import { successResponse } from '@/common/response/response.util.js';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * Get active session.
   *
   * 為什麼：
   * 可以根據 Session Token Hash 驗證目前登入狀態。
   *
   * 注意：
   * 正式版本通常會透過 Guard / AuthService 處理，
   * 不會讓前端直接傳 tokenHash 查詢。
   */
  @Get(':tokenHash')
  @ApiOperation({
    summary: 'Get active session / 取得有效 Session',
    description: `
Get an active session by token hash.

根據 Token Hash 取得目前有效的 Session。
`,
  })
  async findActive(@Param('tokenHash') tokenHash: string) {
    const session = await this.sessionService.findActiveByTokenHash(tokenHash);

    return successResponse(
      200,
      {
        en: 'Session retrieved successfully',
        zh: '取得 Session 成功',
      },
      session,
    );
  }

  /**
   * Revoke session.
   *
   * 為什麼：
   * 登出單一裝置時，只需要撤銷該 Session。
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Revoke session / 撤銷 Session',
    description: `
Revoke a session.

撤銷指定的登入 Session。
`,
  })
  async revoke(@Param('id', ParseUUIDPipe) id: string) {
    const session = await this.sessionService.revoke(id);

    return successResponse(
      200,
      {
        en: 'Session revoked successfully',
        zh: '撤銷 Session 成功',
      },
      {
        count: session.count,
      },
    );
  }

  /**
   * Revoke all user sessions.
   *
   * 為什麼：
   * 使用者選擇「全部裝置登出」時，
   * 一次撤銷該 User 所有 Session。
   */
  @Delete('user/:userId/all')
  @ApiOperation({
    summary: 'Revoke all sessions / 撤銷所有 Session',
    description: `
Revoke all sessions belonging to a user.

撤銷指定使用者的所有登入 Session。
`,
  })
  async revokeAll(@Param('userId', ParseUUIDPipe) userId: string) {
    const result = await this.sessionService.revokeAllByUserId(userId);

    return successResponse(
      200,
      {
        en: 'All sessions revoked successfully',
        zh: '已撤銷所有 Session',
      },
      {
        count: result.count,
      },
    );
  }
}

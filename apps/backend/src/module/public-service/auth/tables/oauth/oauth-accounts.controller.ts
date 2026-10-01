import { Controller, Delete, Get, Param, ParseUUIDPipe } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { OauthAccountsService } from './oauth-accounts.service.js';

import { ApiResponse } from '@/common/response/response.util.js';
import { ApiEnvelopeResponse } from '@/common/response/swagger-response.decorator.js';
import { MESSAGES } from '@/common/response/messages.js';
import { SuccessDataDto } from '../../dto/auth-response.dto.js';
import { OAuthAccountDto } from './dto/oauth-account-response.dto.js';

@ApiTags('OAuth Accounts')
@Controller('oauth-accounts')
export class OauthAccountsController {
  constructor(private readonly oauthAccountService: OauthAccountsService) {}

  /**
   * Get user's OAuth accounts.
   *
   * 為什麼：
   * 一個 User 可以綁定多個 OAuth Provider，
   * 例如 Google、GitHub、Apple。
   */
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get OAuth accounts / 取得 OAuth 帳號',
    description: `
Get all OAuth accounts belonging to a user.

取得指定使用者綁定的所有 OAuth 帳號。
`,
  })
  @ApiEnvelopeResponse({
    status: 200,
    message: MESSAGES.OAUTH_ACCOUNTS_RETRIEVED,
    data: OAuthAccountDto,
    isArray: true,
  })
  async findByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    const accounts = await this.oauthAccountService.findByUserId(userId);

    /**
     * 為什麼：
     * OAuth Account 屬於列表資料，
     * 沒有資料時回傳 []，方便前端直接使用 map。
     */
    return ApiResponse(200, MESSAGES.OAUTH_ACCOUNTS_RETRIEVED, accounts);
  }

  /**
   * Delete OAuth account.
   *
   * 為什麼：
   * 讓使用者解除已綁定的第三方登入方式。
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete OAuth account / 解除 OAuth 帳號',
    description: `
Remove an OAuth account binding.

解除指定的 OAuth 帳號綁定。
`,
  })
  @ApiEnvelopeResponse({
    status: 200,
    message: MESSAGES.OAUTH_ACCOUNT_DELETED,
    data: SuccessDataDto,
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.oauthAccountService.remove(id);

    return ApiResponse(200, MESSAGES.OAUTH_ACCOUNT_DELETED, result);
  }
}

import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserPasswordsService } from './user-passwords.service.js';

import { ApiResponse } from '@/common/response/response.util.js';
import { ApiEnvelopeResponse } from '@/common/response/swagger-response.decorator.js';
import { MESSAGES } from '@/common/response/messages.js';
import { PasswordReferenceDto, SetPasswordDto } from './dto/password.dto.js';

@ApiTags('User Password')
@Controller('users/:userId/password')
export class UserPasswordsController {
  constructor(private readonly userPasswordService: UserPasswordsService) {}

  /**
   * Create password.
   *
   * 為什麼：
   * OAuth-only User 如果要新增 Email + Password 登入方式，
   * 可以透過這個 API 建立 Password。
   *
   * 注意：
   * 實際使用時 password 必須先經過 Hash，
   * 不能直接存入資料庫。
   */
  @Post()
  @ApiOperation({
    summary: 'Set password / 設定密碼',
    description: `
Set a password for a user.

為使用者設定密碼。
`,
  })
  @ApiBody({ type: SetPasswordDto })
  @ApiEnvelopeResponse({
    status: 201,
    message: MESSAGES.PASSWORD_CREATED,
    data: PasswordReferenceDto,
  })
  async create(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: SetPasswordDto,
  ) {
    /**
     * 注意：
     * 這裡目前只是示範 Controller 結構。
     *
     * 正式版本應該：
     *
     * password
     *   ↓
     * Password Hash Service
     *   ↓
     * passwordHash
     *   ↓
     * UserPasswordService
     */
    const passwordHash = dto.password;

    const password = await this.userPasswordService.create(
      userId,
      passwordHash,
    );

    /**
     * 為什麼：
     * passwordHash 絕對不能回傳給前端。
     */
    return ApiResponse(201, MESSAGES.PASSWORD_CREATED, {
      id: password.id,
      userId: password.userId,
    });
  }

  /**
   * Update password.
   *
   * 為什麼：
   * 使用者修改現有密碼時，只更新 Password Hash。
   */
  @Patch()
  @ApiOperation({
    summary: 'Update password / 更新密碼',
    description: `
Update user's password.

更新使用者密碼。
`,
  })
  @ApiBody({ type: SetPasswordDto })
  @ApiEnvelopeResponse({
    status: 200,
    message: MESSAGES.PASSWORD_UPDATED,
    data: PasswordReferenceDto,
  })
  async update(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: SetPasswordDto,
  ) {
    const passwordHash = dto.password;

    const password = await this.userPasswordService.update(
      userId,
      passwordHash,
    );

    return ApiResponse(200, MESSAGES.PASSWORD_UPDATED, {
      id: password.id,
      userId: password.userId,
    });
  }
}

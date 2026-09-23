import {
    Body,
    Controller,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
} from '@nestjs/common';

import {
    ApiBody,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { UserPasswordService } from './user-passwords.service.js';

import { successResponse } from '@/common/response/response.util.js';

class CreatePasswordDto {
  password!: string;
}

class UpdatePasswordDto {
  password!: string;
}

@ApiTags('User Password')
@Controller('users/:userId/password')
export class UserPasswordController {
  constructor(
    private readonly userPasswordService: UserPasswordService,
  ) {}

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
  @ApiBody({
    schema: {
      example: {
        password: 'StrongPassword123!',
      },
    },
  })
  async create(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: CreatePasswordDto,
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

    const password =
      await this.userPasswordService.create(
        userId,
        passwordHash,
      );

    /**
     * 為什麼：
     * passwordHash 絕對不能回傳給前端。
     */
    return successResponse(
      201,
      {
        en: 'Password created successfully',
        zh: '建立密碼成功',
      },
      {
        id: password.id,
        userId: password.userId,
      },
    );
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
  @ApiBody({
    schema: {
      example: {
        password: 'NewStrongPassword123!',
      },
    },
  })
  async update(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    const passwordHash = dto.password;

    const password =
      await this.userPasswordService.update(
        userId,
        passwordHash,
      );

    return successResponse(
      200,
      {
        en: 'Password updated successfully',
        zh: '更新密碼成功',
      },
      {
        id: password.id,
        userId: password.userId,
      },
    );
  }
}
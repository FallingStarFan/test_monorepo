// user-roles.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../../guard/jwt-auth.guard.js';
import { RequireStudioAdmin } from '../../guard/require-role/app-role.decorator.js';
import { RequireRoleGuard } from '../../guard/require-role/require-role.guard.js';
import { AuthRolesService } from './auth-role.service.js';
import { AssignRoleDto } from './dto/assign-role.dto.js';
import { UserRolesService } from './user-roles.service.js';
import { ApiResult } from '@/common/validation/api.decorator.js';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@ApiTags('Auth/Roles')
@ApiBearerAuth()
@ApiResult(HttpStatus.UNAUTHORIZED, {
  en: 'Authentication required',
  zh: '需要登入驗證',
})
@ApiResult(HttpStatus.FORBIDDEN, {
  en: 'Permission denied',
  zh: '沒有權限執行此操作',
})
@UseGuards(JwtAuthGuard, RequireRoleGuard)
@Controller('roles')
export class UserRolesController {
  constructor(
    private readonly authRoleService: AuthRolesService,
    private readonly userRoleService: UserRolesService,
  ) {}

  /**
   * GET /roles/me
   * 從經過 JWT 驗證的 request.user 取得目前使用者 ID。
   */
  @Get('me')
  @ApiResult(HttpStatus.OK, {
    en: 'My roles retrieved successfully',
    zh: '取得目前登入者角色成功',
  })
  @ApiOperation({
    summary: '取得目前登入者的角色',
    description: '取得目前登入者在所有 App 底下的角色。',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '取得目前登入者角色成功',
  })
  async getMyRoles(@Req() request: AuthenticatedRequest) {
    const roles = await this.authRoleService.getAuthRoles(request.user.id);

    return roles;
  }

  /**
   * GET /roles/users/:userId
   * 查詢指定使用者的角色。
   */
  @Get('users/:userId')
  @RequireStudioAdmin()
  @ApiOperation({ summary: '取得指定使用者的角色' })
  @ApiResult(HttpStatus.OK, {
    en: 'User roles retrieved successfully',
    zh: '取得使用者角色成功',
  })
  @ApiResult(HttpStatus.BAD_REQUEST, {
    en: 'Invalid user ID format',
    zh: '使用者 ID 格式錯誤',
  })
  @ApiResult(HttpStatus.FORBIDDEN, {
    en: 'Permission denied',
    zh: '沒有管理員權限',
  })
  async findById(
  @Param('userId', new ParseUUIDPipe()) userId: string,
) {
  return this.userRoleService.findByUser(userId);
}

  /**
   * POST /roles/users/:userId
   * 指派角色給指定使用者。
   */
  @Post('users/:userId')
  @HttpCode(HttpStatus.CREATED)
  @RequireStudioAdmin()
  @ApiResult(HttpStatus.CREATED, {
    en: 'Role assigned successfully',
    zh: '角色指派成功',
  })
  @ApiOperation({
    summary: '指派角色給使用者',
    description: '將指定角色授予目標使用者，需要管理員權限。',
  })
  @ApiParam({
    name: 'userId',
    description: '目標使用者 ID',
    format: 'uuid',
  })
  async assign(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: AssignRoleDto,
  ) {
    const result = await this.userRoleService.assign(userId, dto.roleId);

    return result;
  }

  /**
   * DELETE /roles/users/:userId/:roleId
   * 移除指定使用者的角色。
   */
  @Delete('users/:userId/:roleId')
  @HttpCode(HttpStatus.OK)
  @RequireStudioAdmin()
  @ApiOperation({
    summary: '移除使用者角色',
    description: '撤銷目標使用者的指定角色，需要管理員權限。',
  })
  @ApiParam({
    name: 'userId',
    description: '目標使用者 ID',
    format: 'uuid',
  })
  @ApiParam({
    name: 'roleId',
    description: '要移除的角色 ID',
    format: 'uuid',
  })
  async revoke(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
  ) {
    const result = await this.userRoleService.revoke(userId, roleId);

    return result
  }
}
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
import { ApiEnvelopeResponse } from '@/common/response/swagger-response.decorator.js';
import { MESSAGES } from '@/common/response/messages.js';
import { AuthRoleDto } from '../../dto/auth-response.dto.js';
import {
  UserRoleDto,
  UserRoleWithRoleDto,
} from './dto/user-role-response.dto.js';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@ApiTags('Auth/Roles')
@ApiBearerAuth()
@ApiResult(HttpStatus.UNAUTHORIZED, MESSAGES.AUTHENTICATION_REQUIRED)
@ApiResult(HttpStatus.FORBIDDEN, MESSAGES.PERMISSION_DENIED)
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
  @ApiOperation({
    summary: '取得目前登入者的角色',
    description: '取得目前登入者在所有 App 底下的角色。',
  })
  @ApiEnvelopeResponse({
    status: HttpStatus.OK,
    message: MESSAGES.MY_ROLES_RETRIEVED,
    data: AuthRoleDto,
    isArray: true,
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
  @ApiResult(HttpStatus.BAD_REQUEST, MESSAGES.INVALID_UUID_FORMAT)
  @ApiResult(HttpStatus.FORBIDDEN, MESSAGES.PERMISSION_DENIED)
  @ApiEnvelopeResponse({
    status: HttpStatus.OK,
    message: MESSAGES.USER_ROLES_RETRIEVED,
    data: UserRoleWithRoleDto,
    isArray: true,
  })
  async findById(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.userRoleService.findByUser(userId);
  }

  /**
   * POST /roles/users/:userId
   * 指派角色給指定使用者。
   */
  @Post('users/:userId')
  @HttpCode(HttpStatus.CREATED)
  @RequireStudioAdmin()
  @ApiOperation({
    summary: '指派角色給使用者',
    description: '將指定角色授予目標使用者，需要管理員權限。',
  })
  @ApiParam({
    name: 'userId',
    description: '目標使用者 ID',
    format: 'uuid',
  })
  @ApiEnvelopeResponse({
    status: HttpStatus.CREATED,
    message: MESSAGES.ROLE_ASSIGNED,
    data: UserRoleDto,
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
  @ApiEnvelopeResponse({
    status: HttpStatus.OK,
    message: MESSAGES.ROLE_REVOKED,
    data: UserRoleDto,
  })
  async revoke(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
  ) {
    const result = await this.userRoleService.revoke(userId, roleId);

    return result;
  }
}

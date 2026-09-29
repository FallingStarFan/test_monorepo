// my-roles.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { successResponse } from '@/common/response/response.util.js';
import { JwtAuthGuard } from '../../jwt/jwt-auth.guard.js';
import { RequireRole } from '../../jwt/require-role/require-role.decorator.js';
import { AuthRolesService } from './auth-role.service.js';
import type { AssignRoleDto } from './dto/assign-role.dto.js';
import { UserRolesService } from './user-roles.service.js';


type AuthenticatedRequest = Request & {
  user: { id: string }; // 若 Guard 放的是 userId，這裡也一起調整
};

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('auth/me/role')
export class UserRoleController {
  constructor(private readonly authRoleService: AuthRolesService,
  private readonly userRoleService: UserRolesService,
  ) {}

  @Get()
  @ApiOperation({ summary: '取得目前登入者的角色' })
  @ApiQuery({
    name: 'appId',
    required: false,
    description: '不填則查詢所有 App',
  })
  getMyRoles(
    @Req() request: AuthenticatedRequest,
    @Query('appId') appId?: string,
  ) {
    return this.authRoleService.getAuthRoles(request.user.id);
  }



  /**
   * GET /users/:userId/roles
   * 查詢使用者的角色
   */
  @Get()
  @ApiOperation({
    summary: 'Get user roles / 取得使用者角色',
    description: '取得指定使用者在所有 App 底下的角色。',
  })
  async findByUser(@Param('userId') userId: string) {
    const roles = await this.userRoleService.findByUser(userId);

    return successResponse(
      200,
      { en: 'User roles retrieved successfully', zh: '取得使用者角色成功' },
      roles,
    );
  }

  /**
   * POST /users/:userId/roles
   * 指派角色給使用者
   */
  @Post()
  @RequireRole('xingfan-studio', 'ADMIN')
  @ApiOperation({
    summary: 'Assign role to user / 指派角色給使用者',
    description: '將指定角色授予使用者，需要管理員權限。',
  })
  async assign(
    @Param('userId') userId: string,
    @Body() dto: AssignRoleDto,
  ) {
    const result = await this.userRoleService.assign(userId, dto.roleId);

    return successResponse(
      201,
      { en: 'Role assigned successfully', zh: '角色指派成功' },
      result,
    );
  }

  /**
   * DELETE /users/:userId/roles/:roleId
   * 移除使用者的角色
   */
  @Delete(':roleId')
  @RequireRole('xingfan-studio', 'ADMIN')
  @ApiOperation({
    summary: 'Revoke role from user / 移除使用者角色',
    description: '撤銷使用者的指定角色，需要管理員權限。',
  })
  async revoke(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    const result = await this.userRoleService.revoke(userId, roleId);

    return successResponse(
      200,
      { en: 'Role revoked successfully', zh: '角色移除成功' },
      result,
    );
  }
}
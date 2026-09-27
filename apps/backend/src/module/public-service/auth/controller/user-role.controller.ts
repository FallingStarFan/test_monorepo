// my-roles.controller.ts
import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../services/jwt/jwt-auth.guard.js';
import { UserRoleService } from '../services/user-role.service.js';


type AuthenticatedRequest = Request & {
  user: { id: string }; // 若 Guard 放的是 userId，這裡也一起調整
};

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('auth/me/role')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

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
    return this.userRoleService.getRolesForApp(request.user.id, appId);
  }
}
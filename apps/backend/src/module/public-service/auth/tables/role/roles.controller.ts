import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiEnvelopeResponse } from '@/common/response/swagger-response.decorator.js';
import { MESSAGES } from '@/common/response/messages.js';
import { RolesService } from './roles.service.js';
import { CreateRoleDto, RoleDto, UpdateRoleDto } from './dto/role.dto.js';

@ApiTags('Auth/Roles')
@Controller('apps/:appId/roles')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  // 取得 App 的所有 Role
  @Get()
  @ApiEnvelopeResponse({
    status: 200,
    message: MESSAGES.ROLES_RETRIEVED,
    data: RoleDto,
    isArray: true,
  })
  findAll(@Param('appId', ParseUUIDPipe) appId: string) {
    return this.roleService.findAllByApp(appId);
  }

  // 取得 App 的單一 Role
  @Get(':roleId')
  @ApiEnvelopeResponse({
    status: 200,
    message: MESSAGES.ROLE_RETRIEVED,
    data: RoleDto,
  })
  findById(
    @Param('appId', ParseUUIDPipe) appId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    return this.roleService.findById(appId, roleId);
  }

  // 建立 App Role
  @Post()
  @ApiEnvelopeResponse({
    status: 201,
    message: MESSAGES.ROLE_CREATED,
    data: RoleDto,
  })
  create(
    @Param('appId', ParseUUIDPipe) appId: string,
    @Body() body: CreateRoleDto,
  ) {
    return this.roleService.create(appId, body.name, body.description);
  }

  // 修改 App Role
  @Patch(':roleId')
  @ApiEnvelopeResponse({
    status: 200,
    message: MESSAGES.ROLE_UPDATED,
    data: RoleDto,
  })
  update(
    @Param('appId', ParseUUIDPipe) appId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() body: UpdateRoleDto,
  ) {
    return this.roleService.update(appId, roleId, body.name, body.description);
  }

  // 刪除 App Role
  @Delete(':roleId')
  @ApiEnvelopeResponse({
    status: 200,
    message: MESSAGES.ROLE_DELETED,
    data: RoleDto,
  })
  remove(
    @Param('appId', ParseUUIDPipe) appId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    return this.roleService.remove(appId, roleId);
  }
}

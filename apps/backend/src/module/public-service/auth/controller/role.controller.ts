import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { RoleService } from '../services/role.service.js';

@Controller('apps/:appId/roles')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
  ) {}

  // 取得 App 的所有 Role
  @Get()
  findAll(
    @Param('appId') appId: string,
  ) {
    return this.roleService.findAllByApp(appId);
  }

  // 取得 App 的單一 Role
  @Get(':roleId')
  findById(
    @Param('appId') appId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.roleService.findById(appId, roleId);
  }

  // 建立 App Role
  @Post()
  create(
    @Param('appId') appId: string,
    @Body()
    body: {
      name: string;
      description?: string;
    },
  ) {
    return this.roleService.create(
      appId,
      body.name,
      body.description,
    );
  }

  // 修改 App Role
  @Patch(':roleId')
  update(
    @Param('appId') appId: string,
    @Param('roleId') roleId: string,
    @Body()
    body: {
      name?: string;
      description?: string;
    },
  ) {
    return this.roleService.update(
      appId,
      roleId,
      body.name,
      body.description,
    );
  }

  // 刪除 App Role
  @Delete(':roleId')
  remove(
    @Param('appId') appId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.roleService.remove(appId, roleId);
  }
}
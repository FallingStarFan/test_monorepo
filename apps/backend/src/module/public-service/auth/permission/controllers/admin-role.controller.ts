import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { RoleService } from '../../role/role.service.js';
import {
  RequirePermission,
  RequireRole,
} from '../decorators/permission.decorators.js';
import {
  CreateRoleDto,
  UpdateRoleDto,
} from '../dto/role.dto.js';
import { PermissionGuard } from '../guards/permission.guard.js';
import {
  ADMIN_ROLE_NAME,
  PERMISSION_CODES,
} from '../permission.constants.js';

/**
 * 角色管理 API。
 *
 * 為什麼路徑帶上 :appId 而不是只靠 roleId：
 * 角色一定隸屬某個 App，把 appId 放進路徑可以讓「這個角色屬於哪個 App」
 * 在 URL 上就可讀，也讓 RoleService 既有的 findById(appId, roleId) 檢查
 * 能直接沿用——避免有人拿 A App 的 roleId 去操作 B App 的資料。
 */
@ApiTags('Permission Admin')
@ApiBearerAuth('access-token')
@UseGuards(PermissionGuard)
@RequireRole(ADMIN_ROLE_NAME)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
  }),
)
@Controller('admin/apps/:appId/roles')
export class AdminRoleController {
  constructor(
    private readonly roleService: RoleService,
  ) {}

  @Get()
  @RequirePermission(PERMISSION_CODES.ROLE_READ)
  @ApiOperation({
    summary: 'List roles / 取得 App 的角色清單',
  })
  @ApiParam({
    name: 'appId',
    description: 'App ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: '成功回傳角色清單。',
  })
  @ApiResponse({
    status: 401,
    description: '未登入或 Access Token 無效。',
  })
  @ApiResponse({
    status: 403,
    description:
      'code = NO_APP_ROLE 或 code = PERMISSION_DENIED。',
  })
  findAll(
    @Param('appId', new ParseUUIDPipe())
    appId: string,
  ) {
    return this.roleService.findAllByApp(appId);
  }

  @Get(':roleId')
  @RequirePermission(PERMISSION_CODES.ROLE_READ)
  @ApiOperation({
    summary: 'Get role / 取得單一角色',
  })
  @ApiParam({
    name: 'appId',
    description: 'App ID (UUID)',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: '成功回傳指定角色。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的角色。',
  })
  findOne(
    @Param('appId', new ParseUUIDPipe())
    appId: string,
    @Param('roleId', new ParseUUIDPipe())
    roleId: string,
  ) {
    return this.roleService.findById(appId, roleId);
  }

  @Post()
  @RequirePermission(PERMISSION_CODES.ROLE_WRITE)
  @ApiOperation({
    summary: 'Create role / 建立角色',
  })
  @ApiParam({
    name: 'appId',
    description: 'App ID (UUID)',
  })
  @ApiBody({
    type: CreateRoleDto,
  })
  @ApiResponse({
    status: 201,
    description: '角色建立成功。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的 App。',
  })
  @ApiResponse({
    status: 409,
    description: '同一個 App 內已有同名角色。',
  })
  create(
    @Param('appId', new ParseUUIDPipe())
    appId: string,
    @Body() dto: CreateRoleDto,
  ) {
    return this.roleService.create(
      appId,
      dto.name,
      dto.description,
    );
  }

  @Patch(':roleId')
  @RequirePermission(PERMISSION_CODES.ROLE_WRITE)
  @ApiOperation({
    summary: 'Update role / 修改角色',
  })
  @ApiParam({
    name: 'appId',
    description: 'App ID (UUID)',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID (UUID)',
  })
  @ApiBody({
    type: UpdateRoleDto,
  })
  @ApiResponse({
    status: 200,
    description: '角色更新成功。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的角色。',
  })
  @ApiResponse({
    status: 409,
    description: '同一個 App 內已有同名角色。',
  })
  update(
    @Param('appId', new ParseUUIDPipe())
    appId: string,
    @Param('roleId', new ParseUUIDPipe())
    roleId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.roleService.update(
      appId,
      roleId,
      dto.name,
      dto.description,
    );
  }

  @Delete(':roleId')
  @RequirePermission(PERMISSION_CODES.ROLE_WRITE)
  @ApiOperation({
    summary: 'Delete role / 刪除角色',
    description:
      '刪除角色時，使用者與角色、角色與權限的關聯都會一併移除（onDelete: Cascade）。',
  })
  @ApiParam({
    name: 'appId',
    description: 'App ID (UUID)',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: '角色刪除成功。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的角色。',
  })
  remove(
    @Param('appId', new ParseUUIDPipe())
    appId: string,
    @Param('roleId', new ParseUUIDPipe())
    roleId: string,
  ) {
    return this.roleService.remove(appId, roleId);
  }
}

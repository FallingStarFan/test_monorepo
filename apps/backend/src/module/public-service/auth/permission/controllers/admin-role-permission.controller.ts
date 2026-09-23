import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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

import { AssignRolePermissionsDto } from '../dto/assign-role-permissions.dto.js';
import {
  RequirePermission,
  RequireRole,
} from '../decorators/permission.decorators.js';
import { PermissionGuard } from '../guards/permission.guard.js';
import {
  ADMIN_ROLE_NAME,
  PERMISSION_CODES,
} from '../permission.constants.js';
import { RolePermissionService } from '../role-permission.service.js';

/**
 * 角色與權限指派 API（RolePermission）。
 *
 * 為什麼路徑是 /admin/roles/:roleId/permissions 而不是 /admin/role-permissions：
 * 這組端點操作的本質是「某個角色的權限集合」，roleId 是必要脈絡。
 * 把 roleId 放在路徑上，前端在做角色權限編輯頁時可以直接沿用當前角色，
 * 也讓 URL 本身就能看出操作對象。
 *
 * PUT 與 POST 的差別刻意保留下來：
 * - POST：追加（勾選清單送出時只補上新增的項目）
 * - PUT ：整批覆蓋（編輯頁按下儲存，最終狀態以此為準）
 * 兩種語意都存在，是因為前端兩種情境都會用到（例如「快速授權」與「完整編輯」）。
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
@Controller('admin/roles/:roleId/permissions')
export class AdminRolePermissionController {
  constructor(
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  @Get()
  @RequirePermission(
    PERMISSION_CODES.ROLE_PERMISSION_READ,
  )
  @ApiOperation({
    summary:
      'List role permissions / 取得角色目前的權限清單',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: '成功回傳該角色的權限指派清單。',
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
  @ApiResponse({
    status: 404,
    description: '找不到指定的角色。',
  })
  findAll(
    @Param('roleId', new ParseUUIDPipe())
    roleId: string,
  ) {
    return this.rolePermissionService.findByRole(roleId);
  }

  @Post()
  @RequirePermission(
    PERMISSION_CODES.ROLE_PERMISSION_WRITE,
  )
  @ApiOperation({
    summary:
      'Assign role permissions / 追加角色權限（冪等）',
    description:
      '只新增尚未擁有的權限，重複指派不會產生錯誤，回傳指派後的完整清單。',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID (UUID)',
  })
  @ApiBody({
    type: AssignRolePermissionsDto,
  })
  @ApiResponse({
    status: 201,
    description: '權限指派完成，回傳角色目前的權限清單。',
  })
  @ApiResponse({
    status: 400,
    description: '請求的權限 ID 中有不存在的項目。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的角色。',
  })
  assign(
    @Param('roleId', new ParseUUIDPipe())
    roleId: string,
    @Body() dto: AssignRolePermissionsDto,
  ) {
    return this.rolePermissionService.assign(
      roleId,
      dto.permissionIds,
    );
  }

  @Put()
  @RequirePermission(
    PERMISSION_CODES.ROLE_PERMISSION_WRITE,
  )
  @ApiOperation({
    summary:
      'Replace role permissions / 覆蓋角色權限',
    description:
      '以請求內容完整取代該角色的權限；整個操作在一個 transaction 內完成，失敗時不會留下半套權限。',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID (UUID)',
  })
  @ApiBody({
    type: AssignRolePermissionsDto,
  })
  @ApiResponse({
    status: 200,
    description: '權限覆蓋完成，回傳角色目前的權限清單。',
  })
  @ApiResponse({
    status: 400,
    description: '請求的權限 ID 中有不存在的項目。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的角色。',
  })
  replace(
    @Param('roleId', new ParseUUIDPipe())
    roleId: string,
    @Body() dto: AssignRolePermissionsDto,
  ) {
    return this.rolePermissionService.replace(
      roleId,
      dto.permissionIds,
    );
  }

  @Delete(':permissionId')
  @RequirePermission(
    PERMISSION_CODES.ROLE_PERMISSION_WRITE,
  )
  @ApiOperation({
    summary:
      'Revoke role permission / 移除單一角色權限',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID (UUID)',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: '權限移除成功。',
  })
  @ApiResponse({
    status: 404,
    description:
      '找不到指定的角色，或該角色沒有這個權限。',
  })
  revoke(
    @Param('roleId', new ParseUUIDPipe())
    roleId: string,
    @Param('permissionId', new ParseUUIDPipe())
    permissionId: string,
  ) {
    return this.rolePermissionService.revoke(
      roleId,
      permissionId,
    );
  }
}

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

import {
  RequirePermission,
  RequireRole,
} from '../decorators/permission.decorators.js';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../dto/permission.dto.js';
import { PermissionGuard } from '../guards/permission.guard.js';
import {
  ADMIN_ROLE_NAME,
  PERMISSION_CODES,
} from '../permission.constants.js';
import { PermissionService } from '../permission.service.js';

/**
 * 權限碼管理 API。
 *
 * 為什麼把「權限碼」獨立成一個 Controller，而不是塞進 Role Controller：
 * 權限碼是所有 App 共用的全域資源（同一組 code 可以被多個 App 的角色引用），
 * 它的生命週期與角色不同（角色隸屬某個 App，權限碼不隸屬任何 App），
 * 混在一起會讓路由語意變成 /apps/:appId/permissions 這種容易誤解的形式。
 */
@ApiTags('Permission Admin')
@ApiBearerAuth('access-token')
@UseGuards(PermissionGuard)
// 類別層宣告「需要 ADMIN 角色」：這是需求中「只有 public-service 的 admin 可執行」
// 的身分限制；方法層的 @RequirePermission 則是細粒度能力限制，兩者一起生效。
@RequireRole(ADMIN_ROLE_NAME)
// ValidationPipe 掛在類別層一次，避免每個寫入端點重複貼同一行；
// whitelist 會剝除 DTO 未宣告的欄位，防止使用者用額外欄位影響 Prisma 寫入。
@UsePipes(
  new ValidationPipe({
    whitelist: true,
  }),
)
@Controller('admin/permissions')
export class AdminPermissionController {
  constructor(
    private readonly permissionService: PermissionService,
  ) {}

  @Get()
  @RequirePermission(PERMISSION_CODES.PERMISSION_READ)
  @ApiOperation({
    summary: 'List permissions / 取得權限碼清單',
  })
  @ApiResponse({
    status: 200,
    description: '成功回傳權限碼清單。',
  })
  @ApiResponse({
    status: 401,
    description: '未登入或 Access Token 無效。',
  })
  @ApiResponse({
    status: 403,
    description:
      'code = NO_APP_ROLE（沒有 public-service 角色）或 code = PERMISSION_DENIED（角色或權限不足）。',
  })
  findAll() {
    return this.permissionService.findAllPermissions();
  }

  @Get(':permissionId')
  @RequirePermission(PERMISSION_CODES.PERMISSION_READ)
  @ApiOperation({
    summary: 'Get permission / 取得單一權限碼',
  })
  @ApiParam({
    name: 'permissionId',
    description: '權限碼 ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: '成功回傳指定權限碼。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的權限碼。',
  })
  findOne(
    @Param('permissionId', new ParseUUIDPipe())
    permissionId: string,
  ) {
    return this.permissionService.findPermissionById(
      permissionId,
    );
  }

  @Post()
  @RequirePermission(PERMISSION_CODES.PERMISSION_WRITE)
  @ApiOperation({
    summary: 'Create permission / 建立權限碼',
  })
  @ApiBody({
    type: CreatePermissionDto,
  })
  @ApiResponse({
    status: 201,
    description: '權限碼建立成功。',
  })
  @ApiResponse({
    status: 409,
    description: '權限碼已存在。',
  })
  create(
    @Body() dto: CreatePermissionDto,
  ) {
    return this.permissionService.createPermission({
      code: dto.code,
      name: dto.name,
      description: dto.description,
    });
  }

  @Patch(':permissionId')
  @RequirePermission(PERMISSION_CODES.PERMISSION_WRITE)
  @ApiOperation({
    summary: 'Update permission / 修改權限碼',
  })
  @ApiParam({
    name: 'permissionId',
    description: '權限碼 ID (UUID)',
  })
  @ApiBody({
    type: UpdatePermissionDto,
  })
  @ApiResponse({
    status: 200,
    description: '權限碼更新成功。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的權限碼。',
  })
  @ApiResponse({
    status: 409,
    description: '變更後的權限碼與其他權限碼重複。',
  })
  update(
    @Param('permissionId', new ParseUUIDPipe())
    permissionId: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.permissionService.updatePermission(
      permissionId,
      {
        code: dto.code,
        name: dto.name,
        description: dto.description,
      },
    );
  }

  @Delete(':permissionId')
  @RequirePermission(PERMISSION_CODES.PERMISSION_WRITE)
  @ApiOperation({
    summary: 'Delete permission / 刪除權限碼',
    description:
      '刪除權限碼時，所有角色對它的指派關係會一併移除（onDelete: Cascade）。',
  })
  @ApiParam({
    name: 'permissionId',
    description: '權限碼 ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: '權限碼刪除成功。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的權限碼。',
  })
  remove(
    @Param('permissionId', new ParseUUIDPipe())
    permissionId: string,
  ) {
    return this.permissionService.removePermission(
      permissionId,
    );
  }
}

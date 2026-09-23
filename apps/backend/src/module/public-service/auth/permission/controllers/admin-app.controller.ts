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

import { AppService } from '../../app/app.service.js';
import {
  RequirePermission,
  RequireRole,
} from '../decorators/permission.decorators.js';
import {
  CreateAppDto,
  UpdateAppDto,
} from '../dto/app.dto.js';
import { PermissionGuard } from '../guards/permission.guard.js';
import {
  ADMIN_ROLE_NAME,
  PERMISSION_CODES,
} from '../permission.constants.js';

/**
 * App 管理 API。
 *
 * 為什麼路由是 /admin/apps 而不是直接沿用既有的 /apps：
 * 既有的 App 端點屬於公開服務的一部分，其 API contract 不能變動；
 * 管理端點另外掛在 /admin 之下，語意上就能一眼看出「這是管理用途、
 * 需要 ADMIN 角色」，未來要對整個 /admin 前綴做額外限制（例如 IP 白名單）
 * 也只需要改一個地方。
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
@Controller('admin/apps')
export class AdminAppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  @Get()
  @RequirePermission(PERMISSION_CODES.APP_READ)
  @ApiOperation({
    summary: 'List apps / 取得 App 清單',
  })
  @ApiResponse({
    status: 200,
    description: '成功回傳 App 清單。',
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
    return this.appService.findAll();
  }

  @Get(':appId')
  @RequirePermission(PERMISSION_CODES.APP_READ)
  @ApiOperation({
    summary: 'Get app / 取得單一 App',
  })
  @ApiParam({
    name: 'appId',
    description: 'App ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: '成功回傳指定 App。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的 App。',
  })
  findOne(
    @Param('appId', new ParseUUIDPipe())
    appId: string,
  ) {
    return this.appService.findByIdOrFail(appId);
  }

  @Post()
  @RequirePermission(PERMISSION_CODES.APP_WRITE)
  @ApiOperation({
    summary: 'Create app / 建立 App',
  })
  @ApiBody({
    type: CreateAppDto,
  })
  @ApiResponse({
    status: 201,
    description: 'App 建立成功。',
  })
  @ApiResponse({
    status: 409,
    description: 'App 名稱已存在。',
  })
  create(@Body() dto: CreateAppDto) {
    return this.appService.create(
      dto.name,
      dto.description,
    );
  }

  @Patch(':appId')
  @RequirePermission(PERMISSION_CODES.APP_WRITE)
  @ApiOperation({
    summary: 'Update app / 修改 App',
  })
  @ApiParam({
    name: 'appId',
    description: 'App ID (UUID)',
  })
  @ApiBody({
    type: UpdateAppDto,
  })
  @ApiResponse({
    status: 200,
    description: 'App 更新成功。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的 App。',
  })
  @ApiResponse({
    status: 409,
    description: '變更後的 App 名稱與其他 App 重複。',
  })
  update(
    @Param('appId', new ParseUUIDPipe())
    appId: string,
    @Body() dto: UpdateAppDto,
  ) {
    return this.appService.update(appId, {
      name: dto.name,
      description: dto.description,
    });
  }

  @Delete(':appId')
  @RequirePermission(PERMISSION_CODES.APP_WRITE)
  @ApiOperation({
    summary: 'Delete app / 刪除 App',
    description:
      '刪除 App 時，其底下的角色會一併被刪除（onDelete: Cascade），回應中的 cascadedRoleCount 會回報連帶刪除的角色數量。',
  })
  @ApiParam({
    name: 'appId',
    description: 'App ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'App 刪除成功。',
  })
  @ApiResponse({
    status: 404,
    description: '找不到指定的 App。',
  })
  remove(
    @Param('appId', new ParseUUIDPipe())
    appId: string,
  ) {
    return this.appService.remove(appId);
  }
}

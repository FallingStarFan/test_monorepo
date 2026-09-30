
// src/user/user.controller.ts

import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';

import {
    ApiBody,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

import { PageQueryDto } from '@/common/pagination/page-query.dto.js';
import { ApiResponse } from '@/common/response/response.util.js';
import { RequireStudioAdmin } from '../../guard/require-role/app-role.decorator.js';

@ApiTags('Auth/Users')
@RequireStudioAdmin()
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
  ) {}

  /**
   * POST /users
   * 建立使用者
   */
  @Post()
  @ApiOperation({
    summary: 'Create user / 建立使用者',
    description: '建立一個新的使用者。',
  })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  /**
   * GET /users
   * 取得使用者列表
   */
  @Get()
  @ApiOperation({
    summary: 'Get users / 取得使用者列表',
    description: `分頁取得使用者列表。`,
  })
  async findAll(@Query() query: PageQueryDto) {
    const users = await this.userService.findAllPageable(
      query.page,
      query.pageSize,
      query.order,
    );

    return users;
  }
  /**
   * GET /users/:id
   * 取得單一使用者
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get user / 取得使用者',
    description: `根據使用者 ID 取得單一使用者資料。`,
  })
  async findById(
  @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.userService.findById(id);
  }
  /**
   * PATCH /users/:id
   * 更新使用者
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user / 更新使用者',
    description: `
Update an existing user by ID.

根據使用者 ID 更新使用者資料。
`,
  })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.userService.update(id, dto);

    return user;
  }

  /**
   * DELETE /users/:id
   * 刪除使用者
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user / 刪除使用者',
    description: `
Delete a user by ID.

根據使用者 ID 刪除使用者。
`,
  })
  async remove(@Param('id') id: string) {
    const result = await this.userService.remove(id);

    return ApiResponse(
      200,
      {
        en: 'User deleted successfully',
        zh: '刪除使用者成功',
      },
      result,
    );
  }
}


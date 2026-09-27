
// src/user/user.controller.ts

import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';

import {
    ApiBody,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { UserService } from '../services/users.service.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import type { UpdateUserDto } from '../users/dto/update-user.dto.js';

import { successResponse } from '@/common/response/response.util.js';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  /**
   * POST /users
   * 建立使用者
   */
  @Post()
  @ApiOperation({
    summary: 'Create user / 建立使用者',
    description: `
Create a new user.

建立一個新的使用者。
`,
  })
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        emailVerified: false,
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
        roleIds: ['00000000-0000-0000-0000-000000000000'],
        status: 'ACTIVE',
      },
    },
  })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);

    return successResponse(
      201,
      {
        en: 'User created successfully',
        zh: '建立使用者成功',
      },
      user,
    );
  }

  /**
   * GET /users
   * 取得使用者列表
   */
  @Get()
  @ApiOperation({
    summary: 'Get users / 取得使用者列表',
    description: `
Get all users.

取得所有使用者列表。
`,
  })
  async findAll() {
    const users = await this.userService.findAll();

    return successResponse(
      200,
      {
        en: 'Users retrieved successfully',
        zh: '取得使用者列表成功',
      },
      users,
    );
  }

  /**
   * GET /users/:id
   * 取得單一使用者
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get user / 取得使用者',
    description: `
Get a user by ID.

根據使用者 ID 取得單一使用者資料。
`,
  })
  async findById(@Param('id') id: string) {
    const user = await this.userService.findById(id);

    return successResponse(
      200,
      {
        en: 'User retrieved successfully',
        zh: '取得使用者成功',
      },
      user,
    );
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
  @ApiBody({
    schema: {
      example: {
        email: 'updated@example.com',
        emailVerified: true,
        name: 'Updated Name',
        image: 'https://example.com/new-avatar.jpg',
        roleIds: ['00000000-0000-0000-0000-000000000000'],
        status: 'ACTIVE',
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.userService.update(id, dto);

    return successResponse(
      200,
      {
        en: 'User updated successfully',
        zh: '更新使用者成功',
      },
      user,
    );
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

    return successResponse(
      200,
      {
        en: 'User deleted successfully',
        zh: '刪除使用者成功',
      },
      result,
    );
  }
}


// src/user/dto/create-user.dto.ts

import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsBoolean,
  IsEnum,
} from '@/common/validation/validators.decorator.js';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@/module/public-service/prisma.js';

export class CreateUserDto {
  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'User email address / 使用者 Email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: false,
    description:
      'Whether the email has been verified / Email 是否已驗證；未傳入時為 false',
  })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'User display name / 使用者顯示名稱',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'User avatar URL / 使用者頭像 URL',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

  @ApiPropertyOptional({
    example: ['00000000-0000-0000-0000-000000000000'],
    description: 'Role IDs to assign to the user / 指派給使用者的角色 ID',
    type: [String],
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  @IsUUID()
  roleIds?: string[];

  @ApiPropertyOptional({
    example: UserStatus.ACTIVE,
    enum: UserStatus,
    description: 'User status / 使用者狀態；未傳入時為 ACTIVE',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

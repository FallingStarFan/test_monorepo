
// src/user/dto/create-user.dto.ts

import {
  IsBoolean,
  IsEmail,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

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
    default: false,
    description: 'Whether the email has been verified / Email 是否已驗證',
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
  @IsUUID('4', { each: true })
  roleIds?: string[];

  @ApiPropertyOptional({
    example: UserStatus.ACTIVE,
    default: UserStatus.ACTIVE,
    enum: UserStatus,
    description: 'User status / 使用者狀態',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}


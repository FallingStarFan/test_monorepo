import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'app:read',
    description:
      '權限碼，格式為 resource:action（僅小寫英數、冒號、減號、底線）',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  // 為什麼要限制格式：權限碼會出現在 @RequirePermission 的字串中，
  // 若允許任意字元（含空白、全形字），會出現肉眼難以分辨的兩個權限碼，
  // 造成「明明指派了卻一直 403」的問題。
  @Matches(/^[a-z0-9:_-]+$/, {
    message:
      'permission code must match /^[a-z0-9:_-]+$/ (權限碼只能包含小寫英數、冒號、減號與底線)',
  })
  code!: string;

  @ApiProperty({
    example: '讀取 App',
    description: '權限名稱（給人看的中文名稱）',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: '查詢 App 清單與單一 App 的設定。',
    description: '權限說明',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    example: 'app:read',
    description:
      '權限碼，格式為 resource:action（僅小寫英數、冒號、減號、底線）',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9:_-]+$/, {
    message:
      'permission code must match /^[a-z0-9:_-]+$/ (權限碼只能包含小寫英數、冒號、減號與底線)',
  })
  code?: string;

  @ApiPropertyOptional({
    example: '讀取 App',
    description: '權限名稱（給人看的中文名稱）',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: '查詢 App 清單與單一 App 的設定。',
    description: '權限說明',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

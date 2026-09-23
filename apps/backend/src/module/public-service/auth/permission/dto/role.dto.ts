import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * 角色名稱在同一個 App 內必須唯一（由資料庫的 @@unique([appId, name]) 保證），
 * 因此 DTO 只需驗證格式，不需要重複表達唯一性規則。
 */
export class CreateRoleDto {
  @ApiProperty({
    example: 'EDITOR',
    description: '角色名稱，同一個 App 內唯一 / Unique within app',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: '可編輯內容但無法管理權限',
    description: '角色說明 / Role description',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: 'EDITOR',
    description: '角色名稱，同一個 App 內唯一 / Unique within app',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: '可編輯內容但無法管理權限',
    description: '角色說明 / Role description',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

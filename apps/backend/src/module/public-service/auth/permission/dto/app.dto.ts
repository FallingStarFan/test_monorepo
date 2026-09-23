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
 * 為什麼 Create 與 Update 放在同一個檔案：
 *
 * 兩者的欄位幾乎完全重疊，差別只在「必填」與「選填」。
 * 放在一起改動時不會只改了一邊而漏掉另一邊，
 * 閱讀時也能一眼看出哪些欄位在建立後可以修改。
 */

export class CreateAppDto {
  @ApiProperty({
    example: 'canvas',
    description: 'App 名稱，系統內唯一 / Unique app name',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: '線上白板服務',
    description: 'App 說明 / App description',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateAppDto {
  @ApiPropertyOptional({
    example: 'canvas',
    description: 'App 名稱，系統內唯一 / Unique app name',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: '線上白板服務',
    description: 'App 說明 / App description',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

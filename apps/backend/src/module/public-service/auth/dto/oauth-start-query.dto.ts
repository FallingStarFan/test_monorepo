import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsOptional,
  IsString,
  MaxLength,
} from '@/common/validation/validators.decorator.js';

export class OAuthStartQueryDto {
  @ApiPropertyOptional({
    example: '/dashboard',
    description: 'OAuth 完成後導回的前端站內相對路徑。',
    maxLength: 2048,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  returnTo?: string;
}

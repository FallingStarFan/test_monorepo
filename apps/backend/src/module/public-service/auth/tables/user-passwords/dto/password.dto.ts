import { ApiProperty } from '@nestjs/swagger';

import {
  IsString,
  MaxLength,
  MinLength,
} from '@/common/validation/validators.decorator.js';

export class SetPasswordDto {
  @ApiProperty({
    example: 'StrongPassword123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class PasswordReferenceDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;
}

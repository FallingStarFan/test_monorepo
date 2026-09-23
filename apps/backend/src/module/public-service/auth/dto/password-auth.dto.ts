import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PasswordLoginDto {
  @ApiProperty({ example: 'user@example.com', description: '帳號 Email。' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPassword123!', description: '帳號密碼。' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class PasswordRegisterDto extends PasswordLoginDto {
  @ApiPropertyOptional({ example: 'Jane Doe', description: '顯示名稱。', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}

import { ApiProperty } from '@nestjs/swagger';

import { UserStatus } from '../../prisma.js';

export class AuthUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ nullable: true, example: 'user@example.com' })
  email!: string | null;

  emailVerified!: boolean;

  @ApiProperty({ nullable: true, example: 'Jane Doe' })
  name!: string | null;

  @ApiProperty({ nullable: true, example: 'https://example.com/avatar.jpg' })
  image!: string | null;

  @ApiProperty({ enum: UserStatus, enumName: 'UserStatus' })
  status!: UserStatus;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class AuthRoleDto {
  @ApiProperty({ example: 'xingfan-studio' })
  appName!: string;

  @ApiProperty({ type: [String], example: ['ADMIN', 'USER'] })
  roleName!: string[];
}

export class AccessTokenMetadataDto {
  @ApiProperty({ format: 'date-time' })
  expiresAt!: string;
}

export class AuthSessionDataDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({ type: [AuthRoleDto] })
  roles!: AuthRoleDto[];

  @ApiProperty({ type: AccessTokenMetadataDto })
  accessToken!: AccessTokenMetadataDto;
}

export class RefreshSessionDataDto {
  @ApiProperty({ type: AccessTokenMetadataDto })
  accessToken!: AccessTokenMetadataDto;
}

export class SuccessDataDto {
  @ApiProperty({ example: true })
  success!: boolean;
}

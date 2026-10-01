import { ApiProperty } from '@nestjs/swagger';

import { UserStatus } from '@/module/public-service/prisma.js';

export class UserRoleSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  appId!: string;

  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class UserRoleAssignmentDto {
  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty({ format: 'uuid' })
  roleId!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: UserRoleSummaryDto })
  role!: UserRoleSummaryDto;
}

export class UserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ nullable: true })
  email!: string | null;

  emailVerified!: boolean;

  @ApiProperty({ nullable: true })
  name!: string | null;

  @ApiProperty({ nullable: true })
  image!: string | null;

  @ApiProperty({ type: [UserRoleAssignmentDto] })
  role!: UserRoleAssignmentDto[];

  @ApiProperty({ enum: UserStatus, enumName: 'UserStatus' })
  status!: UserStatus;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class PaginationDto {
  page!: number;
  pageSize!: number;
  total!: number;
  totalPages!: number;
  hasNext!: boolean;
  hasPrev!: boolean;
}

export class PaginatedUsersDto {
  @ApiProperty({ type: [UserDto] })
  items!: UserDto[];

  @ApiProperty({ type: PaginationDto })
  pagination!: PaginationDto;
}

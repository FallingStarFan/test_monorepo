import { ApiProperty } from '@nestjs/swagger';

export class AppSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class RoleWithAppDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  appId!: string;

  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ type: AppSummaryDto })
  app!: AppSummaryDto;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class UserRoleDto {
  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty({ format: 'uuid' })
  roleId!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class UserRoleWithRoleDto extends UserRoleDto {
  @ApiProperty({ type: RoleWithAppDto })
  role!: RoleWithAppDto;
}

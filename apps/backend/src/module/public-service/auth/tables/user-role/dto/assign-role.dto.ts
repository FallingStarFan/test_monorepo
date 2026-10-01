import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from '@/common/validation/validators.decorator.js';

export class AssignRoleDto {
  @ApiProperty({
    description: '要指派的角色 ID',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  roleId!: string;
}

// update-user.dto.ts
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto.js';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, [
    'emailVerified',
    'roleIds',
    'status',
  ] as const),
) {}
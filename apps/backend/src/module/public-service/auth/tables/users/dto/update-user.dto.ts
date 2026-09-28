import { PartialType } from '@nestjs/swagger';

import { CreateUserDto } from './create-user.dto.js';

export class UpdateUserDto extends PartialType(CreateUserDto) {}


// import { OmitType, PartialType } from '@nestjs/swagger';

// import { CreateUserDto } from './create-user.dto.js';

// export class UpdateUserDto extends PartialType(
//   OmitType(CreateUserDto, [
//     'emailVerified',
//     'role',
//     'status',
//   ] as const),
// ) {}
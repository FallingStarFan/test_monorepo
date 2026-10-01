// update-user.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto.js';

/**
 * 管理端允許更新 CreateUserDto 的全部欄位。
 * roleIds 有傳入時代表完整取代角色，未傳入則保留既有角色。
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}

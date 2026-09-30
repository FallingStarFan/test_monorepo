// require-role.decorator.ts

import { SetMetadata } from '@nestjs/common';

export type RequiredRole = {
  appName: string;
  roleName: string;
};

export const REQUIRED_ROLES_KEY = 'requiredRoles';

export const RequireRole = (...roles: RequiredRole[]) =>
  SetMetadata(REQUIRED_ROLES_KEY, roles);




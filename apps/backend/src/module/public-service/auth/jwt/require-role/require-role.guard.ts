// require-role.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_ROLES_KEY } from './require-role.decorator.js';

  
type RequiredRole = { appName: string; roleName: string };
type AuthRole = { appName: string; roleName: string[] };

@Injectable()
export class RequireRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RequiredRole>(
     REQUIRED_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) return true;

    const request = context.switchToHttp().getRequest<{
      user?: { id: string; roles?: AuthRole[] };
    }>();

    return (
      request.user?.roles?.some(
        (role) =>
          role.appName === required.appName &&
          role.roleName.includes(required.roleName),
      ) ?? false
    );
  }
}
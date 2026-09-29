import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RequireRoleGuard } from './require-role/require-role.guard.js';

import env from '@/config/env.js';
import { JwtAuthService } from './jwt.service.js';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: env.jwtAccessSecret,
      signOptions: {
        expiresIn: env.jwtAccessExpires,
      },
    }),
  ],
  providers: [JwtAuthService, RequireRoleGuard],
  exports: [JwtAuthService, JwtModule, RequireRoleGuard],   // ← 加上 JwtModule 和 RequireRoleGuard
})
export class JwtAuthModule {}
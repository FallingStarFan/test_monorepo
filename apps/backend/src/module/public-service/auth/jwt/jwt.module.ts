import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

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
  providers: [JwtAuthService],
  exports: [JwtAuthService, JwtModule],   // ← 加上 JwtModule
})
export class JwtAuthModule {}
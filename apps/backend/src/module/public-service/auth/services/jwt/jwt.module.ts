import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import env from '@/config/env.js';

import { SessionModule } from '../../sessions/sessions.module.js';
import { JwtAuthService } from './jwt.service.js';

@Module({
  imports: [
    SessionModule,
    JwtModule.register({
      secret: env.jwtAccessSecret,
      signOptions: {
        expiresIn: env.jwtAccessExpires,
      },
    }),
  ],
  providers: [JwtAuthService],
  exports: [JwtAuthService],
})
export class JwtAuthModule {}

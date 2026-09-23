import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import env from '@/config/env.js';
import { JwtAuthService } from './jwt.service.js';

@Module({
  imports: [
    JwtModule.register({
      secret: env.jwtAccessSecret,
      signOptions: {
        expiresIn: env.jwtAccessExpires as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    }),
  ],
  providers: [JwtAuthService],
  exports: [JwtAuthService],
})
export class JwtAuthModule {}
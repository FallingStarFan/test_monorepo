import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  Strategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20';

// 💡 1. 移除 ConfigService，改引入您的靜態 env 物件
// (請根據您的實際檔案路徑調整 import 路徑)


import type { OAuthProfile } from '../auth.service.js';
import env from '@/config/env.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor() {
    // 💡 2. 這裡完全不需要 private readonly configService 了，constructor 可以保持空白
    super({
      // 💡 3. 直接使用 env. 擁有完美的自動提示與型別安全！
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      
      // ⚠️ 注意：您之前的 env 物件漏了 callbackUrl，記得要去 env 檔案補上 requiredEnv('GOOGLE_CALLBACK_URL')
      callbackURL: env.googleCallbackUrl, 
     
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
     console.log('GoogleStrategy callbackURL:', env.googleCallbackUrl);

    const email = profile.emails?.[0]?.value;
    const image = profile.photos?.[0]?.value;

    const oauthProfile: OAuthProfile = {
      provider: 'google',
      providerAccountId: profile.id,
      email,
      name: profile.displayName,
      image,
    };

    done(null, oauthProfile);
  }
}
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  Strategy,
  Profile,
} from 'passport-github2';

// 💡 1. 移除 ConfigService，改引入您的靜態 env 物件
// (請根據您的實際檔案路徑調整 import 路徑)


import type { OAuthProfile } from '../auth.service.js';
import env from '@/config/env.js';

type OAuthVerifyCallback = (
  error: unknown,
  user?: OAuthProfile,
) => void;

@Injectable()
export class GithubStrategy extends PassportStrategy(
  Strategy,
  'github',
) {
  constructor() {
    // 💡 2. 移除 private readonly configService，constructor 保持空白
    super({
      // 💡 3. 直接使用 env 物件，享有完美的型別安全與自動提示！
      clientID: env.githubClientId,
      clientSecret: env.githubClientSecret,
      callbackURL: env.githubCallbackUrl,

      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: OAuthVerifyCallback,
  ) {
    const oauthProfile: OAuthProfile = {
      provider: 'github',
      providerAccountId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName || profile.username,
      image: profile.photos?.[0]?.value,
    };

    done(null, oauthProfile);
  }
}
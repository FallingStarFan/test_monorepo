import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

import env from '@/config/env.js';

import type { OAuthProfile } from '../auth.service.js';

type OAuthVerifyCallback = (error: unknown, user?: OAuthProfile) => void;

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: env.githubClientId,
      clientSecret: env.githubClientSecret,
      callbackURL: env.githubCallbackUrl,
      scope: ['user:email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: OAuthVerifyCallback,
  ) {
    const oauthProfile: OAuthProfile = {
      provider: 'github',
      providerAccountId: profile.id,
      email: profile.emails?.[0]?.value,
      // passport-github2 does not expose verified email metadata. Existing
      // accounts therefore require an explicit linking flow instead of auto-link.
      emailVerified: false,
      name: profile.displayName || profile.username,
      image: profile.photos?.[0]?.value,
    };

    done(null, oauthProfile);
  }
}

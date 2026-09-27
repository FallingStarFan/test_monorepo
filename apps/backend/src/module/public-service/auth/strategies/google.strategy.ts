import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

import env from '@/config/env.js';

import type { OAuthProfile } from '../auth.service.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl,
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const raw = profile._json as { email_verified?: boolean };

    const oauthProfile: OAuthProfile = {
      provider: 'google',
      providerAccountId: profile.id,
      email: profile.emails?.[0]?.value,
      emailVerified: raw.email_verified === true,
      name: profile.displayName,
      image: profile.photos?.[0]?.value,
    };

    done(null, oauthProfile);
  }
}

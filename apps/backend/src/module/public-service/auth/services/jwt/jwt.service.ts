import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AccessTokenPayload {
  sub: string;
  exp: number;
}

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async issueAccessToken(userId: string) {
    const token = await this.jwtService.signAsync({
      sub: userId,
    });
    const payload = this.jwtService.decode(token) as {
      exp?: number;
    } | null;

    if (!payload?.exp) {
      throw new UnauthorizedException('JWT expiration is missing');
    }

    return {
      token,
      expiresAt: new Date(payload.exp * 1000),
    };
  }

  async verifyAccessToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      return {
        userId: payload.sub,
        expiresAt: new Date(payload.exp * 1000),
      };
    } catch {
      throw new UnauthorizedException({
        message: {
          en: 'Invalid or expired access token',
          zh: 'Access Token 無效或已過期',
        },
      });
    }
  }
}
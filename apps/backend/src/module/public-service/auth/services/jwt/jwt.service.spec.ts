import { JwtService } from '@nestjs/jwt';

import { JwtAuthService } from './jwt.service.js';

describe('JwtAuthService', () => {
  const service = new JwtAuthService(
    new JwtService({
      secret: 'unit-test-secret',
      signOptions: { expiresIn: '1h' },
    }),
  );

  it('issues and verifies an access token without a database', async () => {
    const issued = await service.issueAccessToken('user-id');
    const verified = await service.verifyAccessToken(issued.token);

    expect(verified.userId).toBe('user-id');
    expect(verified.expiresAt.getTime()).toBe(issued.expiresAt.getTime());
  });

  it('rejects an invalid access token', async () => {
    await expect(
      service.verifyAccessToken('invalid-token'),
    ).rejects.toMatchObject({
      status: 401,
    });
  });
});
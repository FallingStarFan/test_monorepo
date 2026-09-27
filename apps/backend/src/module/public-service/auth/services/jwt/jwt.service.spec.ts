import { JwtService } from '@nestjs/jwt';

import type { SessionService } from '../../sessions/sessions.service.js';
import { JwtAuthService } from './jwt.service.js';

describe('JwtAuthService', () => {
  const sessionService = {
    findActiveById: vi.fn(),
  };
  const service = new JwtAuthService(
    new JwtService({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    sessionService as unknown as SessionService,
  );

  beforeEach(() => {
    sessionService.findActiveById.mockReset();
    sessionService.findActiveById.mockResolvedValue({ id: 'session-id' });
  });

  it('issues and verifies an access JWT bound to an active session', async () => {
    const issued = await service.issueAccessToken('user-id', 'session-id');
    const verified = await service.verifyAccessToken(issued.token);

    expect(verified).toMatchObject({
      userId: 'user-id',
      sessionId: 'session-id',
    });
    expect(verified.expiresAt.getTime()).toBe(issued.expiresAt.getTime());
    expect(sessionService.findActiveById).toHaveBeenCalledWith(
      'session-id',
      'user-id',
    );
  });

  it('issues a distinct refresh JWT type', async () => {
    const issued = await service.issueRefreshToken('user-id', 'session-id');
    const verified = await service.verifyRefreshToken(issued.token);

    expect(verified).toMatchObject({
      userId: 'user-id',
      sessionId: 'session-id',
    });
    await expect(service.verifyAccessToken(issued.token)).rejects.toMatchObject(
      { status: 401 },
    );
  });

  it('rejects an access JWT after its session is revoked', async () => {
    sessionService.findActiveById.mockResolvedValue(null);
    const issued = await service.issueAccessToken('user-id', 'session-id');

    await expect(service.verifyAccessToken(issued.token)).rejects.toMatchObject(
      { status: 401 },
    );
  });

  it('rejects an invalid JWT', async () => {
    await expect(
      service.verifyAccessToken('invalid-token'),
    ).rejects.toMatchObject({ status: 401 });
  });
});

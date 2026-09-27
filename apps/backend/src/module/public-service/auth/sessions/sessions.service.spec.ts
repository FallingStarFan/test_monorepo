import { SessionService } from './sessions.service.js';

describe('SessionService refresh rotation', () => {
  it('atomically replaces the stored refresh hash', async () => {
    const prisma = {
      session: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUnique: vi.fn(),
      },
    };
    const service = new SessionService(prisma as never);

    await service.rotateRefreshToken({
      id: 'session-id',
      userId: 'user-id',
      currentTokenHash: 'old-hash',
      nextTokenHash: 'new-hash',
      nextExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });

    expect(prisma.session.updateMany).toHaveBeenCalledOnce();
    expect(prisma.session.findUnique).not.toHaveBeenCalled();
  });

  it('revokes the session when an already-rotated JWT is replayed', async () => {
    const prisma = {
      session: {
        updateMany: vi
          .fn()
          .mockResolvedValueOnce({ count: 0 })
          .mockResolvedValueOnce({ count: 1 }),
        findUnique: vi.fn().mockResolvedValue({
          userId: 'user-id',
          tokenHash: 'new-hash',
          revokedAt: null,
        }),
      },
    };
    const service = new SessionService(prisma as never);

    await expect(
      service.rotateRefreshToken({
        id: 'session-id',
        userId: 'user-id',
        currentTokenHash: 'old-hash',
        nextTokenHash: 'next-hash',
        nextExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
      }),
    ).rejects.toMatchObject({ status: 401 });

    expect(prisma.session.updateMany).toHaveBeenLastCalledWith({
      where: {
        id: 'session-id',
        revokedAt: null,
      },
      data: {
        revokedAt: expect.any(Date),
      },
    });
  });
});

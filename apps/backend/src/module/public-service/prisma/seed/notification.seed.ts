import type { PrismaService } from '../prisma.service.js';

export async function seedNotification(
  _prisma: PrismaService,
) {
  console.log(
    'Notification seed skipped: no initial data.',
  );
}
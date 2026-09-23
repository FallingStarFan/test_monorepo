import type { PrismaService } from '../prisma.service.js';

export async function seedFile(
  _prisma: PrismaService,
) {
  console.log(
    'File seed skipped: no initial data.',
  );
}
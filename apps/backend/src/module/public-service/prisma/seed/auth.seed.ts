import type { PrismaService } from '../prisma.service.js';

export async function seedAuth(
  prisma: PrismaService,
) {
  console.log('Seeding Auth...');

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email: 'admin@example.com',
      },
    });

  if (existingUser) {
    console.log(
      'Auth seed skipped: admin already exists.',
    );

    return;
  }

  const systemApp = await prisma.app.upsert({
    where: { name: 'system' },
    update: {},
    create: { name: 'system' },
  });

  const adminRole = await prisma.role.upsert({
    where: {
      appId_name: {
        appId: systemApp.id,
        name: 'ADMIN',
      },
    },
    update: {},
    create: {
      appId: systemApp.id,
      name: 'ADMIN',
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin',
      role: {
        create: {
          role: {
            connect: { id: adminRole.id },
          },
        },
      },
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  console.log(
    'Auth seed completed.',
  );
}

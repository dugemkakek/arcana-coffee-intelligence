// @arcana/db-local — dev seed.
// Creates a default tenant + a few minimal entities so the UI has something
// to point at after a fresh `prisma migrate dev`.
//
// Run with: pnpm --filter @arcana/db-local seed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-roastery' },
    update: {},
    create: {
      name: 'Demo Roastery',
      slug: 'demo-roastery',
      country: 'ID',
      timezone: 'Asia/Jakarta',
      plan: 'free',
    },
  });

  const location = await prisma.location.upsert({
    where: { id: 'seed-location-1' },
    update: {},
    create: {
      id: 'seed-location-1',
      tenantId: tenant.id,
      name: 'Main Roastery',
      type: 'roastery',
      country: 'ID',
      city: 'Jakarta',
      timezone: 'Asia/Jakarta',
    },
  });

  const machine = await prisma.machine.upsert({
    where: { id: 'seed-machine-1' },
    update: {},
    create: {
      id: 'seed-machine-1',
      tenantId: tenant.id,
      locationId: location.id,
      name: 'VNT 2.5kg #1',
      manufacturer: 'VNT',
      model: '2.5kg',
      batchCapacityKg: 2.5,
      dataLoggerType: 'phidget',
    },
  });

  console.log('Seeded:', { tenant: tenant.slug, location: location.id, machine: machine.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

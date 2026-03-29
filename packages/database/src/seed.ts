import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { faker } from '@faker-js/faker';

async function main() {
  const pool = new Pool({
    connectionString: "postgresql://postgres:password@localhost:5433/amm_db",
  });
  const db = drizzle(pool, { schema });

  console.log('🚀 Starting Full Demo Seed...');

  // 1. CLEAR OLD DATA
  await db.delete(schema.auditLogs);
  await db.delete(schema.appointments);
  await db.delete(schema.businessHours);
  await db.delete(schema.holidays);

  // 2. SEED APPOINTMENTS
  console.log('⏳ Generating 29 Appointments...');
  const allMockAppointments = Array.from({ length: 29 }).map(() => ({
    requestorName: faker.person.fullName().substring(0, 255),
    organization: faker.company.name().substring(0, 255),
    country: 'Ethiopia',
    city: faker.location.city().substring(0, 100),
    issueDescription: faker.lorem.sentence(),
    // Fixed function name to match latest Faker JS
    mobile: faker.helpers.replaceSymbols('+251 9## ### ###'),
    email: faker.internet.email().substring(0, 255),
    suggestedTime: faker.date.future(),
    state: faker.helpers.arrayElement(['PENDING', 'CONFIRMED', 'COMPLETED']),
  }));

  const insertedApps = [];
  for (let i = 0; i < allMockAppointments.length; i += 5) {
    const chunk = allMockAppointments.slice(i, i + 5);
    const result = await db.insert(schema.appointments).values(chunk).returning();
    insertedApps.push(...result);
  }
  console.log(`✅ ${insertedApps.length} Appointments created.`);

  // 3. SEED AUDIT LOGS
  const mockLogs = insertedApps.map((app) => ({
    appointmentId: app.id,
    userId: 'admin-seed',
    previousState: 'INITIAL',
    newState: app.state,
    actionDetails: { note: "Seeded" },
  }));
  await db.insert(schema.auditLogs).values(mockLogs);
  console.log('✅ Audit Logs linked.');

  // 4. SEED BUSINESS HOURS (Mon-Fri)
  const workingDays = [1, 2, 3, 4, 5];
  const hours = workingDays.map((day) => ({
    id: day,
    dayOfWeek: day as any,
    startTime: '08:30:00',
    endTime: '17:30:00',
  }));
  await db.insert(schema.businessHours).values(hours);
  console.log('✅ Business Hours set.');

  // 5. SEED HOLIDAYS
  const holidays = [
    { date: '2026-04-12', description: 'Easter (Fasika)' },
    { date: '2026-05-01', description: 'Labour Day' },
  ];
  await db.insert(schema.holidays).values(holidays);
  console.log('✅ Ethiopian Holidays added.');

  console.log('✨ SEEDING COMPLETE! Visit http://196.189.237.3 to see the data.');
  await pool.end();
}

main().catch(console.error);

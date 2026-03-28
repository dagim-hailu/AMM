import { pgTable, uuid, varchar, text, timestamp, boolean, smallint, integer, time, date, jsonb } from 'drizzle-orm/pg-core';

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestorName: varchar('requestor_name', { length: 255 }).notNull(),
  organization: varchar('organization', { length: 255 }),
  country: varchar('country', { length: 100 }),
  city: varchar('city', { length: 100 }),
  issueDescription: text('issue_description'),
  mobile: varchar('mobile', { length: 20 }),
  altMobile: varchar('alt_mobile', { length: 20 }),
  email: varchar('email', { length: 255 }),
  suggestedTime: timestamp('suggested_time'),
  confirmedTime: timestamp('confirmed_time'),
  state: varchar('state', { length: 20 }).notNull(),
  rescheduleNotes: text('reschedule_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  userId: varchar('user_id', { length: 255 }),
  previousState: varchar('previous_state', { length: 20 }),
  newState: varchar('new_state', { length: 20 }),
  actionDetails: jsonb('action_details'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const businessHours = pgTable('business_hours', {
  id: integer('id').primaryKey(),
  dayOfWeek: smallint('day_of_week'),
  startTime: time('start_time'),
  endTime: time('end_time'),
});

export const holidays = pgTable('holidays', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  description: text('description'),
});

import { pgTable, uuid, varchar, text, timestamp, boolean, smallint, integer, time, date, jsonb, primaryKey } from 'drizzle-orm/pg-core';

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

// ====================== AUTHENTICATION TABLES ======================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  hashedPassword: varchar('hashed_password', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('staff'),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  permissions: jsonb('permissions').notNull().default({}),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  baseUrl: varchar('base_url', { length: 500 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userApplications = pgTable('user_applications', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  applicationId: uuid('application_id').references(() => applications.id, { onDelete: 'cascade' }).notNull(),
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  assignedAt: timestamp('assigned_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.applicationId] }),
}));

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
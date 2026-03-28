"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidays = exports.businessHours = exports.auditLogs = exports.appointments = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.appointments = (0, pg_core_1.pgTable)('appointments', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    requestorName: (0, pg_core_1.varchar)('requestor_name', { length: 255 }).notNull(),
    organization: (0, pg_core_1.varchar)('organization', { length: 255 }),
    country: (0, pg_core_1.varchar)('country', { length: 100 }),
    city: (0, pg_core_1.varchar)('city', { length: 100 }),
    issueDescription: (0, pg_core_1.text)('issue_description'),
    mobile: (0, pg_core_1.varchar)('mobile', { length: 20 }),
    altMobile: (0, pg_core_1.varchar)('alt_mobile', { length: 20 }),
    email: (0, pg_core_1.varchar)('email', { length: 255 }),
    suggestedTime: (0, pg_core_1.timestamp)('suggested_time'),
    confirmedTime: (0, pg_core_1.timestamp)('confirmed_time'),
    state: (0, pg_core_1.varchar)('state', { length: 20 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
exports.auditLogs = (0, pg_core_1.pgTable)('audit_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id),
    userId: (0, pg_core_1.varchar)('user_id', { length: 255 }),
    previousState: (0, pg_core_1.varchar)('previous_state', { length: 20 }),
    newState: (0, pg_core_1.varchar)('new_state', { length: 20 }),
    actionDetails: (0, pg_core_1.jsonb)('action_details'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
exports.businessHours = (0, pg_core_1.pgTable)('business_hours', {
    id: (0, pg_core_1.integer)('id').primaryKey(),
    dayOfWeek: (0, pg_core_1.smallint)('day_of_week'),
    startTime: (0, pg_core_1.time)('start_time'),
    endTime: (0, pg_core_1.time)('end_time'),
});
exports.holidays = (0, pg_core_1.pgTable)('holidays', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    date: (0, pg_core_1.date)('date').notNull(),
    description: (0, pg_core_1.text)('description'),
});

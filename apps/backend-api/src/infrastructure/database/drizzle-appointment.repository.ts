import { Injectable } from '@nestjs/common';
import { db, appointments, eq, and, or, ilike, desc, asc, sql, count } from '@amm/database';
import { IAppointmentRepository, FindAllOptions } from '../../domain/ports/appointment.repository';
import { Appointment, AppointmentState } from '../../domain/entities/appointment.entity';

@Injectable()
export class DrizzleAppointmentRepository implements IAppointmentRepository {
  async save(appointment: Appointment): Promise<void> {
    const data = {
      id: appointment.id,
      requestorName: appointment.requestor.name,
      organization: appointment.requestor.organization ?? null,
      country: appointment.requestor.country,
      city: appointment.requestor.city,
      issueDescription: appointment.requestor.issueDescription,
      mobile: appointment.requestor.mobile,
      altMobile: appointment.requestor.altMobile ?? null,
      email: appointment.requestor.email,
      state: appointment.state,
      suggestedTime: appointment.suggestedTime,
      confirmedTime: appointment.confirmedTime ?? null,
      rescheduleNotes: appointment.rescheduleNotes ?? null,
      updatedAt: appointment.updatedAt,
    };

    await db.insert(appointments)
      .values({ ...data, createdAt: appointment.createdAt })
      .onConflictDoUpdate({
        target: appointments.id,
        set: data,
      });
  }

  async findById(id: string): Promise<Appointment | null> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id));
    if (result.length === 0) return null;

    const row = result[0];
    return this.mapToEntity(row);
  }

  async findAll(): Promise<Appointment[]> {
    const results = await db.select().from(appointments).orderBy(desc(appointments.createdAt));
    return results.map(row => this.mapToEntity(row));
  }

  async findAllAdvanced(options: FindAllOptions): Promise<{ data: Appointment[], total: number }> {
    const { search, state, country, limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const conditions = [];
    if (state) conditions.push(eq(appointments.state, state));
    if (country) conditions.push(eq(appointments.country, country));
    if (search) {
      conditions.push(or(
        ilike(appointments.requestorName, `%${search}%`),
        ilike(appointments.email, `%${search}%`),
        ilike(appointments.mobile, `%${search}%`),
        ilike(appointments.organization, `%${search}%`)
      ));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const afterTomorrow = new Date(tomorrow);
    afterTomorrow.setDate(afterTomorrow.getDate() + 1);

    const effectiveTime = sql`COALESCE(${appointments.confirmedTime}, ${appointments.suggestedTime})`;

    if (options.view === 'today') {
      conditions.push(and(
        sql`${effectiveTime} >= ${today}`,
        sql`${effectiveTime} < ${tomorrow}`
      ));

      // Filter by lateness when late option is specified
      if (options.late !== undefined) {
        const fifteenMinutesAgo = sql`NOW() - INTERVAL '15 minutes'`;
        if (options.late) {
          // Late appointments: effective time is more than 15 minutes ago
          conditions.push(sql`${effectiveTime} <= ${fifteenMinutesAgo}`);
        } else {
          // Upcoming appointments: effective time is within next 15 minutes or future
          conditions.push(sql`${effectiveTime} > ${fifteenMinutesAgo}`);
        }
      }
    } else if (options.view === 'tomorrow') {
      conditions.push(and(
        sql`${effectiveTime} >= ${tomorrow}`,
        sql`${effectiveTime} < ${afterTomorrow}`
      ));
    } else if (options.view === 'upcoming') {
      conditions.push(sql`${effectiveTime} >= ${afterTomorrow}`);
    } else if (options.view === 'passed') {
      // Show appointments that are more than 24 hours old (passed one day)
      conditions.push(sql`${effectiveTime} < NOW() - INTERVAL '1 day'`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count query
    const totalResult = await db.select({ value: count() }).from(appointments).where(whereClause);
    const total = Number(totalResult[0]?.value || 0);

    // Data query
    let orderBy;
    let sortField;

    switch (sortBy) {
      case 'suggestedTime': sortField = appointments.suggestedTime; break;
      case 'confirmedTime': sortField = appointments.confirmedTime; break;
      case 'createdAt':
      default: sortField = appointments.createdAt; break;
    }

    orderBy = sortOrder === 'DESC' ? desc(sortField) : asc(sortField);

    // Override sorting for "Today" view if requested
    if (options.view === 'today') {
      // Proximity sorting: ABS(effectiveTime - NOW())
      orderBy = asc(sql`ABS(EXTRACT(EPOCH FROM (${effectiveTime} - NOW())))`);
    }

    const results = await db.select()
      .from(appointments)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return {
      data: results.map(row => this.mapToEntity(row)),
      total,
    };
  }

  private mapToEntity(row: any): Appointment {
    return Appointment.reconstruct({
      id: row.id,
      requestor: {
        name: row.requestorName,
        organization: row.organization,
        country: row.country,
        city: row.city,
        issueDescription: row.issueDescription,
        mobile: row.mobile,
        altMobile: row.altMobile,
        email: row.email,
      },
      state: row.state as AppointmentState,
      suggestedTime: row.suggestedTime,
      confirmedTime: row.confirmedTime,
      rescheduleNotes: row.rescheduleNotes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}

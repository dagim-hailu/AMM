import { Appointment } from '../entities/appointment.entity';

export interface FindAllOptions {
  search?: string;
  state?: string;
  country?: string;
  view?: 'today' | 'tomorrow' | 'upcoming' | 'passed';
  late?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'suggestedTime' | 'confirmedTime';
  sortOrder?: 'ASC' | 'DESC';
}

export interface IAppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  findById(id: string): Promise<Appointment | null>;
  findAll(): Promise<Appointment[]>;
  findAllAdvanced(options: FindAllOptions): Promise<{ data: Appointment[], total: number }>;
}

export const IAppointmentRepository = Symbol('IAppointmentRepository');

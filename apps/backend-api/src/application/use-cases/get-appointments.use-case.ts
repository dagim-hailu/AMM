import { Injectable, Inject } from '@nestjs/common';
import { IAppointmentRepository, FindAllOptions } from '../../domain/ports/appointment.repository';
import { Appointment } from '../../domain/entities/appointment.entity';

@Injectable()
export class GetAppointmentsUseCase {
  constructor(
    @Inject(IAppointmentRepository) private readonly repository: IAppointmentRepository,
  ) {}

  async execute(options: FindAllOptions = {}): Promise<{ data: Appointment[], total: number }> {
    return this.repository.findAllAdvanced(options);
  }
}

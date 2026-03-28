import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IAppointmentRepository } from '../../domain/ports/appointment.repository';
import { IEventPublisher } from '../../domain/ports/event.publisher';
import { Appointment } from '../../domain/entities/appointment.entity';

@Injectable()
export class RescheduleAppointmentUseCase {
  constructor(
    @Inject(IAppointmentRepository) private readonly repository: IAppointmentRepository,
    @Inject(IEventPublisher) private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(id: string, newTime: Date, notes?: string, sendEmail?: boolean): Promise<Appointment> {
    const appointment = await this.repository.findById(id);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    appointment.reschedule(newTime, notes);
    await this.repository.save(appointment);

    if (sendEmail) {
      await this.eventPublisher.publish('appointment.rescheduled', {
        appointmentId: id,
        email: appointment.requestor.email,
        name: appointment.requestor.name,
        newTime: newTime.toISOString(),
        notes: notes || 'No additional notes provided.',
      });
    }
    
    return appointment;
  }
}

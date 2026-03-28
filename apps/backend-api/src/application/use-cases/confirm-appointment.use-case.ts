import { Injectable, Inject } from '@nestjs/common';
import { IAppointmentRepository } from '../../domain/ports/appointment.repository';
import { IEventPublisher } from '../../domain/ports/event.publisher';
import { DomainError } from '../../domain/errors/domain.error';

@Injectable()
export class ConfirmAppointmentUseCase {
  constructor(
    @Inject(IAppointmentRepository) private readonly repository: IAppointmentRepository,
    @Inject(IEventPublisher) private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(id: string, time: Date): Promise<void> {
    const appointment = await this.repository.findById(id);
    if (!appointment) {
      throw new DomainError('Appointment not found');
    }

    appointment.confirm(time);
    
    await this.repository.save(appointment);
    await this.eventPublisher.publish('AppointmentConfirmedEvent', { id: appointment.id, time: time });
  }
}

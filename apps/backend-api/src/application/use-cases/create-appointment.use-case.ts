import { Injectable, Inject } from '@nestjs/common';
import { IAppointmentRepository } from '../../domain/ports/appointment.repository';
import { IEventPublisher } from '../../domain/ports/event.publisher';
import { Appointment, RequestorDetails } from '../../domain/entities/appointment.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject(IAppointmentRepository) private readonly repository: IAppointmentRepository,
    @Inject(IEventPublisher) private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(requestor: RequestorDetails, suggestedTime: Date): Promise<Appointment> {
    const appointment = Appointment.request(randomUUID(), requestor, suggestedTime);
    
    await this.repository.save(appointment);
    await this.eventPublisher.publish('AppointmentSubmittedEvent', { id: appointment.id, state: appointment.state });

    return appointment;
  }
}

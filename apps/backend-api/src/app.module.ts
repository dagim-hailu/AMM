import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentsController } from './presentation/appointments.controller';
import { CreateAppointmentUseCase } from './application/use-cases/create-appointment.use-case';
import { ConfirmAppointmentUseCase } from './application/use-cases/confirm-appointment.use-case';
import { RescheduleAppointmentUseCase } from './application/use-cases/reschedule-appointment.use-case';
import { GetAppointmentsUseCase } from './application/use-cases/get-appointments.use-case';
import { DrizzleAppointmentRepository } from './infrastructure/database/drizzle-appointment.repository';
import { RedisEventPublisher } from './infrastructure/events/redis-event.publisher';
import { IAppointmentRepository } from './domain/ports/appointment.repository';
import { IEventPublisher } from './domain/ports/event.publisher';

@Module({
  imports: [],
  controllers: [AppController, AppointmentsController],
  providers: [
    AppService,
    CreateAppointmentUseCase,
    ConfirmAppointmentUseCase,
    RescheduleAppointmentUseCase,
    GetAppointmentsUseCase,
    {
      provide: IAppointmentRepository,
      useClass: DrizzleAppointmentRepository,
    },
    {
      provide: IEventPublisher,
      useClass: RedisEventPublisher,
    },
  ],
})
export class AppModule {}

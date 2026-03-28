import { Controller, Post, Body, Param, Put, Get, HttpException, HttpStatus, Inject, Query } from '@nestjs/common';
import { CreateAppointmentUseCase } from '../application/use-cases/create-appointment.use-case';
import { ConfirmAppointmentUseCase } from '../application/use-cases/confirm-appointment.use-case';
import { RescheduleAppointmentUseCase } from '../application/use-cases/reschedule-appointment.use-case';
import { GetAppointmentsUseCase } from '../application/use-cases/get-appointments.use-case';
import type { RequestorDetailsDTO } from '@amm/api-contracts';
import { DomainError } from '../domain/errors/domain.error';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    @Inject(CreateAppointmentUseCase) private readonly createUseCase: CreateAppointmentUseCase,
    @Inject(ConfirmAppointmentUseCase) private readonly confirmUseCase: ConfirmAppointmentUseCase,
    @Inject(RescheduleAppointmentUseCase) private readonly rescheduleUseCase: RescheduleAppointmentUseCase,
    @Inject(GetAppointmentsUseCase) private readonly getAppointmentsUseCase: GetAppointmentsUseCase,
  ) { }

  private mapToDTO(apt: any) {
    return {
      id: apt.id,
      requestor: {
        name: apt.requestor.name,
        organization: apt.requestor.organization,
        country: apt.requestor.country,
        city: apt.requestor.city,
        issueDescription: apt.requestor.issueDescription,
        mobile: apt.requestor.mobile,
        altMobile: apt.requestor.altMobile,
        email: apt.requestor.email,
      },
      state: apt.state === 'PENDING' ? 'REQUESTED' : apt.state,
      suggestedTime: apt.suggestedTime,
      confirmedTime: apt.confirmedTime,
      rescheduleNotes: apt.rescheduleNotes,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt,
    };
  }

  @Get()
  async getAppointments(
    @Query('search') search?: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
    @Query('view') view?: 'today' | 'tomorrow' | 'upcoming' | 'passed',
    @Query('late') late?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sortBy') sortBy?: any,
    @Query('sortOrder') sortOrder?: any,
  ) {
    try {
      const result = await this.getAppointmentsUseCase.execute({
        search,
        state,
        country,
        view,
        late: late !== undefined ? late === 'true' : undefined,
        limit: limit ? parseInt(limit) : 10,
        offset: offset ? parseInt(offset) : 0,
        sortBy,
        sortOrder,
      });
      return {
        data: result.data.map(apt => this.mapToDTO(apt)),
        total: result.total,
      };
    } catch (e: any) {
      throw new HttpException('Internal Server Error: ' + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async requestAppointment(@Body() dto: RequestorDetailsDTO) {
    try {
      const suggestedTime = new Date(dto.suggestedTime);
      const appointment = await this.createUseCase.execute(dto, suggestedTime);
      return {
        message: 'Appointment requested successfully',
        referenceId: appointment.id,
        appointment: this.mapToDTO(appointment)
      };
    } catch (e: any) {
      if (e instanceof DomainError) {
        throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Internal Server Error: ' + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/confirm')
  async confirmAppointment(@Param('id') id: string, @Body('newTime') newTime: string) {
    try {
      await this.confirmUseCase.execute(id, new Date(newTime));
      return { message: 'Appointment confirmed' };
    } catch (e: any) {
      if (e instanceof DomainError) {
        throw new HttpException(e.message, HttpStatus.CONFLICT);
      }
      throw new HttpException('Internal Server Error: ' + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/reschedule')
  async rescheduleAppointment(
    @Param('id') id: string,
    @Body('newTime') newTime: string,
    @Body('notes') notes?: string,
    @Body('sendEmail') sendEmail?: boolean,
  ) {
    try {
      const appointment = await this.rescheduleUseCase.execute(id, new Date(newTime), notes, sendEmail);
      return {
        message: 'Appointment rescheduled',
        appointment: this.mapToDTO(appointment)
      };
    } catch (e: any) {
      if (e instanceof DomainError) {
        throw new HttpException(e.message, HttpStatus.CONFLICT);
      }
      throw new HttpException('Internal Server Error: ' + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

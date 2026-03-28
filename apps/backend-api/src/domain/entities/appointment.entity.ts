import { DomainError } from '../errors/domain.error';

export enum AppointmentState {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  RESCHEDULED = 'RESCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface RequestorDetails {
  name: string;
  organization?: string;
  country: string;
  city: string;
  issueDescription: string;
  mobile: string;
  altMobile?: string;
  email: string;
}

export class Appointment {
  private constructor(
    private readonly _id: string,
    private readonly _requestor: RequestorDetails,
    private _state: AppointmentState,
    private _suggestedTime: Date,
    private _confirmedTime: Date | null,
    private _rescheduleNotes: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // Getters
  get id() { return this._id; }
  get requestor() { return this._requestor; }
  get state() { return this._state; }
  get suggestedTime() { return this._suggestedTime; }
  get confirmedTime() { return this._confirmedTime; }
  get rescheduleNotes() { return this._rescheduleNotes; }
  get createdAt() { return this._createdAt; }
  get updatedAt() { return this._updatedAt; }

  static request(id: string, requestor: RequestorDetails, suggestedTime: Date): Appointment {
    return new Appointment(
      id,
      requestor,
      AppointmentState.PENDING,
      suggestedTime,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstruct(props: any): Appointment {
    return new Appointment(
      props.id,
      props.requestor,
      props.state,
      props.suggestedTime,
      props.confirmedTime,
      props.rescheduleNotes,
      props.createdAt,
      props.updatedAt,
    );
  }

  confirm(time: Date) {
    if (this._state !== AppointmentState.PENDING && this._state !== AppointmentState.RESCHEDULED) {
      throw new DomainError(`Cannot confirm appointment in state ${this._state}`);
    }
    this._state = AppointmentState.CONFIRMED;
    this._confirmedTime = time;
    this._updatedAt = new Date();
  }

  reschedule(time: Date, notes?: string) {
    if (this._state !== AppointmentState.PENDING && 
        this._state !== AppointmentState.CONFIRMED && 
        this._state !== AppointmentState.RESCHEDULED) {
      throw new DomainError(`Cannot reschedule appointment in state ${this._state}`);
    }
    this._state = AppointmentState.RESCHEDULED;
    this._confirmedTime = time;
    if (notes) this._rescheduleNotes = notes;
    this._updatedAt = new Date();
  }

  cancel() {
    if (this._state === AppointmentState.COMPLETED || this._state === AppointmentState.CANCELLED) {
      throw new DomainError(`Cannot cancel appointment in state ${this._state}`);
    }
    this._state = AppointmentState.CANCELLED;
    this._updatedAt = new Date();
  }

  complete() {
    if (this._state !== AppointmentState.CONFIRMED && this._state !== AppointmentState.RESCHEDULED) {
      throw new DomainError(`Cannot complete appointment in state ${this._state}`);
    }
    this._state = AppointmentState.COMPLETED;
    this._updatedAt = new Date();
  }
}

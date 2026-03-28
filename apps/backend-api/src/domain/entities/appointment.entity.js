"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appointment = exports.AppointmentState = void 0;
const domain_error_1 = require("../errors/domain.error");
var AppointmentState;
(function (AppointmentState) {
    AppointmentState["PENDING"] = "PENDING";
    AppointmentState["CONFIRMED"] = "CONFIRMED";
    AppointmentState["RESCHEDULED"] = "RESCHEDULED";
    AppointmentState["COMPLETED"] = "COMPLETED";
    AppointmentState["CANCELLED"] = "CANCELLED";
})(AppointmentState || (exports.AppointmentState = AppointmentState = {}));
class Appointment {
    constructor(_id, _requestor, _state, _suggestedTime, _confirmedTime, _createdAt, _updatedAt) {
        this._id = _id;
        this._requestor = _requestor;
        this._state = _state;
        this._suggestedTime = _suggestedTime;
        this._confirmedTime = _confirmedTime;
        this._createdAt = _createdAt;
        this._updatedAt = _updatedAt;
    }
    // Getters
    get id() { return this._id; }
    get requestor() { return this._requestor; }
    get state() { return this._state; }
    get suggestedTime() { return this._suggestedTime; }
    get confirmedTime() { return this._confirmedTime; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }
    static request(id, requestor, suggestedTime) {
        return new Appointment(id, requestor, AppointmentState.PENDING, suggestedTime, null, new Date(), new Date());
    }
    static reconstruct(props) {
        return new Appointment(props.id, props.requestor, props.state, props.suggestedTime, props.confirmedTime, props.createdAt, props.updatedAt);
    }
    confirm(time) {
        if (this._state !== AppointmentState.PENDING && this._state !== AppointmentState.RESCHEDULED) {
            throw new domain_error_1.DomainError(`Cannot confirm appointment in state ${this._state}`);
        }
        this._state = AppointmentState.CONFIRMED;
        this._confirmedTime = time;
        this._updatedAt = new Date();
    }
    reschedule(time) {
        if (this._state !== AppointmentState.CONFIRMED) {
            throw new domain_error_1.DomainError(`Cannot reschedule appointment in state ${this._state}`);
        }
        this._state = AppointmentState.RESCHEDULED;
        this._confirmedTime = time;
        this._updatedAt = new Date();
    }
    cancel() {
        if (this._state === AppointmentState.COMPLETED || this._state === AppointmentState.CANCELLED) {
            throw new domain_error_1.DomainError(`Cannot cancel appointment in state ${this._state}`);
        }
        this._state = AppointmentState.CANCELLED;
        this._updatedAt = new Date();
    }
    complete() {
        if (this._state !== AppointmentState.CONFIRMED && this._state !== AppointmentState.RESCHEDULED) {
            throw new domain_error_1.DomainError(`Cannot complete appointment in state ${this._state}`);
        }
        this._state = AppointmentState.COMPLETED;
        this._updatedAt = new Date();
    }
}
exports.Appointment = Appointment;

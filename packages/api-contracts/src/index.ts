import { z } from 'zod';

export const RequestorDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  organization: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  issueDescription: z.string().min(10, 'Please describe your request in detail'),
  mobile: z.string().min(8, 'Valid mobile number is required'),
  altMobile: z.string().optional(),
  email: z.string().email(),
  suggestedTime: z.string().datetime(),
});

export type RequestorDetailsDTO = z.infer<typeof RequestorDetailsSchema>;

export const ConfirmAppointmentSchema = z.object({
  newTime: z.string().datetime().optional(),
});

export type ConfirmAppointmentDTO = z.infer<typeof ConfirmAppointmentSchema>;

import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.string().optional().default('staff'),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export const LogoutRequestSchema = z.object({
  refreshToken: z.string().optional(),
});

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type LoginRequestDTO = z.infer<typeof LoginRequestSchema>;
export type RegisterRequestDTO = z.infer<typeof RegisterRequestSchema>;
export type RefreshTokenRequestDTO = z.infer<typeof RefreshTokenRequestSchema>;
export type LogoutRequestDTO = z.infer<typeof LogoutRequestSchema>;
export type ChangePasswordRequestDTO = z.infer<typeof ChangePasswordRequestSchema>;

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface TokenValidationResponse {
  isValid: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}
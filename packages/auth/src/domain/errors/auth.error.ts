export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class UserNotFoundError extends AuthError {
  constructor(email?: string) {
    super(email ? `User with email ${email} not found` : 'User not found');
    this.name = 'UserNotFoundError';
  }
}

export class UserAlreadyExistsError extends AuthError {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class InvalidTokenError extends AuthError {
  constructor() {
    super('Invalid or expired token');
    this.name = 'InvalidTokenError';
  }
}

export class InsufficientPermissionsError extends AuthError {
  constructor(requiredRole?: string) {
    super(
      requiredRole 
        ? `Insufficient permissions. Required role: ${requiredRole}`
        : 'Insufficient permissions'
    );
    this.name = 'InsufficientPermissionsError';
  }
}

export class ValidationError extends AuthError {
  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

export class AccountInactiveError extends AuthError {
  constructor() {
    super('Account is inactive. Please contact an administrator.');
    this.name = 'AccountInactiveError';
  }
}
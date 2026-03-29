// Export domain entities
export { User } from './domain/entities/user.entity';
export { Role } from './domain/entities/role.entity';
export type { Permission } from './domain/entities/role.entity';

// Export domain ports
export { IAuthRepository } from './domain/ports/auth.repository';
export type { FindUsersOptions } from './domain/ports/auth.repository';
export { ITokenService } from './domain/ports/token.service';
export type { TokenPayload } from './domain/ports/token.service';
export { IPasswordHasher } from './domain/ports/password.hasher';

// Export domain errors
export {
  AuthError,
  InvalidCredentialsError,
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidTokenError,
  InsufficientPermissionsError,
  ValidationError,
  AccountInactiveError,
} from './domain/errors/auth.error';

// Export application use cases
export { LoginUserUseCase } from './application/use-cases/login-user.use-case';
export { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
export { LogoutUserUseCase } from './application/use-cases/logout-user.use-case';
export { ValidateTokenUseCase } from './application/use-cases/validate-token.use-case';

// Export application DTOs
export {
  LoginRequestSchema,
  RegisterRequestSchema,
  RefreshTokenRequestSchema,
  LogoutRequestSchema,
  ChangePasswordRequestSchema,
  type LoginRequestDTO,
  type RegisterRequestDTO,
  type RefreshTokenRequestDTO,
  type LogoutRequestDTO,
  type ChangePasswordRequestDTO,
  type AuthResponse,
  type TokenValidationResponse,
} from './application/dtos/auth.dtos';

// Export infrastructure implementations (for NestJS DI)
export { DrizzleAuthRepository } from './infrastructure/database/drizzle-auth.repository';
export { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password.hasher';
export { JwtTokenService } from './infrastructure/security/jwt-token.service';

// Export presentation layer
export { AuthModule } from './presentation/auth.module';
export { AuthController } from './presentation/auth.controller';

// Export symbols for dependency injection
export { IAuthRepository as IAuthRepositorySymbol } from './domain/ports/auth.repository';
export { ITokenService as ITokenServiceSymbol } from './domain/ports/token.service';
export { IPasswordHasher as IPasswordHasherSymbol } from './domain/ports/password.hasher';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { LoginUserUseCase } from '../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { LogoutUserUseCase } from '../application/use-cases/logout-user.use-case';
import { ValidateTokenUseCase } from '../application/use-cases/validate-token.use-case';
import { DrizzleAuthRepository } from '../infrastructure/database/drizzle-auth.repository';
import { BcryptPasswordHasher } from '../infrastructure/security/bcrypt-password.hasher';
import { JwtTokenService } from '../infrastructure/security/jwt-token.service';
import { IAuthRepository } from '../domain/ports/auth.repository';
import { IPasswordHasher } from '../domain/ports/password.hasher';
import { ITokenService } from '../domain/ports/token.service';

@Module({
  controllers: [AuthController],
  providers: [
    LoginUserUseCase,
    RegisterUserUseCase,
    LogoutUserUseCase,
    ValidateTokenUseCase,
    {
      provide: IAuthRepository,
      useClass: DrizzleAuthRepository,
    },
    {
      provide: IPasswordHasher,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: ITokenService,
      useClass: JwtTokenService,
    },
  ],
  exports: [
    IAuthRepository,
    IPasswordHasher,
    ITokenService,
    LoginUserUseCase,
    RegisterUserUseCase,
    ValidateTokenUseCase,
  ],
})
export class AuthModule {}
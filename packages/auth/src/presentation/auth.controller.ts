import { Controller, Post, Body, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { LoginUserUseCase } from '../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { LogoutUserUseCase } from '../application/use-cases/logout-user.use-case';
import { ValidateTokenUseCase } from '../application/use-cases/validate-token.use-case';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  RefreshTokenRequestSchema,
  LogoutRequestSchema,
  LoginRequestDTO,
  RegisterRequestDTO,
  RefreshTokenRequestDTO,
  LogoutRequestDTO,
  AuthResponse,
  TokenValidationResponse,
} from '../application/dtos/auth.dtos';
import {
  AuthError,
  InvalidCredentialsError,
  UserAlreadyExistsError,
  ValidationError,
  AccountInactiveError,
  InvalidTokenError,
} from '../domain/errors/auth.error';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(LoginUserUseCase) private readonly loginUseCase: LoginUserUseCase,
    @Inject(RegisterUserUseCase) private readonly registerUseCase: RegisterUserUseCase,
    @Inject(LogoutUserUseCase) private readonly logoutUseCase: LogoutUserUseCase,
    @Inject(ValidateTokenUseCase) private readonly validateTokenUseCase: ValidateTokenUseCase,
  ) {}

  @Post('login')
  async login(@Body() body: any): Promise<AuthResponse> {
    try {
      const dto = LoginRequestSchema.parse(body);
      return await this.loginUseCase.execute(dto);
    } catch (error: any) {
      if (error instanceof InvalidCredentialsError || error instanceof AccountInactiveError) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      if (error instanceof ValidationError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('register')
  async register(@Body() body: any): Promise<{ message: string; user: any }> {
    try {
      const dto = RegisterRequestSchema.parse(body);
      const user = await this.registerUseCase.execute(dto);
      return {
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      };
    } catch (error: any) {
      if (error instanceof UserAlreadyExistsError) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      if (error instanceof ValidationError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('logout')
  async logout(@Body() body: any): Promise<{ message: string }> {
    try {
      const dto = LogoutRequestSchema.parse(body);
      await this.logoutUseCase.execute(dto);
      return { message: 'Logged out successfully' };
    } catch (error: any) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('validate')
  async validateToken(@Body('accessToken') accessToken: string): Promise<TokenValidationResponse> {
    try {
      if (!accessToken) {
        throw new HttpException('Access token is required', HttpStatus.BAD_REQUEST);
      }
      return await this.validateTokenUseCase.execute(accessToken);
    } catch (error: any) {
      if (error instanceof InvalidTokenError) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('refresh')
  async refreshToken(@Body() body: any): Promise<{ accessToken: string }> {
    try {
      // This is a simplified refresh token implementation
      // In production, you would verify the refresh token from the database
      // and issue a new access token
      const dto = RefreshTokenRequestSchema.parse(body);
      // TODO: Implement proper refresh token validation
      throw new HttpException('Refresh token endpoint not implemented', HttpStatus.NOT_IMPLEMENTED);
    } catch (error: any) {
      if (error instanceof InvalidTokenError) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
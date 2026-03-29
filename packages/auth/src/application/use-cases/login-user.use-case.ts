import { IAuthRepository } from '../../domain/ports/auth.repository';
import { IPasswordHasher } from '../../domain/ports/password.hasher';
import { ITokenService } from '../../domain/ports/token.service';
import { User } from '../../domain/entities/user.entity';
import { InvalidCredentialsError, AccountInactiveError } from '../../domain/errors/auth.error';
import { LoginRequestDTO, AuthResponse } from '../dtos/auth.dtos';

export class LoginUserUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: LoginRequestDTO): Promise<AuthResponse> {
    // Find user by email
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AccountInactiveError();
    }

    // Verify password
    const isValidPassword = await this.passwordHasher.verify(dto.password, user.hashedPassword);
    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    // Update last login
    user.updateLastLogin();
    await this.authRepository.saveUser(user);

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

    // Save refresh token to database (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}
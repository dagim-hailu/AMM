import { IAuthRepository } from '../../domain/ports/auth.repository';
import { ITokenService } from '../../domain/ports/token.service';
import { InvalidTokenError } from '../../domain/errors/auth.error';
import { TokenValidationResponse } from '../dtos/auth.dtos';

export class ValidateTokenUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(accessToken: string): Promise<TokenValidationResponse> {
    // Verify access token
    const payload = this.tokenService.verifyAccessToken(accessToken);
    if (!payload) {
      return { isValid: false };
    }

    // Check if user exists and is active
    const user = await this.authRepository.findUserById(payload.userId);
    if (!user || !user.isActive) {
      return { isValid: false };
    }

    return {
      isValid: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
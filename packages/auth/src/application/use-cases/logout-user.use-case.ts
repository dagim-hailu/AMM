import { IAuthRepository } from '../../domain/ports/auth.repository';
import { LogoutRequestDTO } from '../dtos/auth.dtos';

export class LogoutUserUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(dto: LogoutRequestDTO): Promise<void> {
    if (dto.refreshToken) {
      // Delete specific refresh token
      await this.authRepository.deleteRefreshToken(dto.refreshToken);
    }
    // If no refresh token provided, we can't delete anything
    // In a real implementation, you might want to delete all tokens for a user
    // but that would require knowing the user ID, which we don't have here
  }
}
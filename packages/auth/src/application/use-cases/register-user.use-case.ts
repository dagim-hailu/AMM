import { IAuthRepository } from '../../domain/ports/auth.repository';
import { IPasswordHasher } from '../../domain/ports/password.hasher';
import { User } from '../../domain/entities/user.entity';
import { UserAlreadyExistsError, ValidationError } from '../../domain/errors/auth.error';
import { RegisterRequestDTO } from '../dtos/auth.dtos';

export class RegisterUserUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(dto: RegisterRequestDTO): Promise<User> {
    // Check if user already exists
    const existingUser = await this.authRepository.findUserByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(dto.email);
    }

    // Validate password meets requirements
    this.validatePassword(dto.password);

    // Hash password
    const hashedPassword = await this.passwordHasher.hash(dto.password);

    // Create user entity
    const user = User.create({
      email: dto.email,
      hashedPassword,
      fullName: dto.fullName,
      role: dto.role,
    });

    // Save user
    await this.authRepository.saveUser(user);

    return user;
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new ValidationError('password', 'Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      throw new ValidationError('password', 'Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new ValidationError('password', 'Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new ValidationError('password', 'Password must contain at least one number');
    }
  }
}
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

export interface FindUsersOptions {
  search?: string;
  role?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface IAuthRepository {
  // User operations
  saveUser(user: User): Promise<void>;
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUsers(options: FindUsersOptions): Promise<{ data: User[], total: number }>;
  deleteUser(id: string): Promise<void>;

  // Role operations
  saveRole(role: Role): Promise<void>;
  findRoleById(id: string): Promise<Role | null>;
  findRoleByName(name: string): Promise<Role | null>;
  findAllRoles(): Promise<Role[]>;
  deleteRole(id: string): Promise<void>;

  // Refresh token operations
  saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  findRefreshToken(token: string): Promise<{ userId: string, expiresAt: Date } | null>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteAllRefreshTokensForUser(userId: string): Promise<void>;
}

export const IAuthRepository = Symbol('IAuthRepository');
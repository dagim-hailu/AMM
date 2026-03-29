import { Injectable } from '@nestjs/common';
import { db, users, roles, refreshTokens, eq, and, or, ilike, desc, count } from '@amm/database';
import { IAuthRepository, FindUsersOptions } from '../../domain/ports/auth.repository';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/entities/role.entity';

@Injectable()
export class DrizzleAuthRepository implements IAuthRepository {
  // User operations
  async saveUser(user: User): Promise<void> {
    const userData = {
      id: user.id,
      email: user.email,
      hashedPassword: user.hashedPassword,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      updatedAt: user.updatedAt,
    };

    const existing = await db.select().from(users).where(eq(users.id, user.id));
    if (existing.length === 0) {
      await db.insert(users).values({
        ...userData,
        createdAt: user.createdAt,
      });
    } else {
      await db.update(users)
        .set(userData)
        .where(eq(users.id, user.id));
    }
  }

  async findUserById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    if (result.length === 0) return null;

    const row = result[0];
    return User.reconstruct({
      id: row.id,
      email: row.email,
      hashedPassword: row.hashedPassword,
      fullName: row.fullName,
      role: row.role,
      isActive: row.isActive ?? true,
      lastLoginAt: row.lastLoginAt ?? undefined,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email));
    if (result.length === 0) return null;

    const row = result[0];
    return User.reconstruct({
      id: row.id,
      email: row.email,
      hashedPassword: row.hashedPassword,
      fullName: row.fullName,
      role: row.role,
      isActive: row.isActive ?? true,
      lastLoginAt: row.lastLoginAt ?? undefined,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
    });
  }

  async findUsers(options: FindUsersOptions): Promise<{ data: User[], total: number }> {
    const { search, role, isActive, limit = 10, offset = 0 } = options;

    const conditions = [];
    if (role) conditions.push(eq(users.role, role));
    if (isActive !== undefined) conditions.push(eq(users.isActive, isActive));
    if (search) {
      conditions.push(or(
        ilike(users.email, `%${search}%`),
        ilike(users.fullName, `%${search}%`)
      ));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count query
    const totalResult = await db.select({ value: count() }).from(users).where(whereClause);
    const total = Number(totalResult[0]?.value || 0);

    // Data query
    const results = await db.select()
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const userEntities = results.map(row =>
      User.reconstruct({
        id: row.id,
        email: row.email,
        hashedPassword: row.hashedPassword,
        fullName: row.fullName,
        role: row.role,
        isActive: row.isActive ?? true,
        lastLoginAt: row.lastLoginAt ?? undefined,
        createdAt: row.createdAt ?? new Date(),
        updatedAt: row.updatedAt ?? new Date(),
      })
    );

    return { data: userEntities, total };
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Role operations
  async saveRole(role: Role): Promise<void> {
    const roleData = {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isSystem: role.isSystem,
    };

    const existing = await db.select().from(roles).where(eq(roles.id, role.id));
    if (existing.length === 0) {
      await db.insert(roles).values({
        ...roleData,
        createdAt: role.createdAt,
      });
    } else {
      await db.update(roles)
        .set(roleData)
        .where(eq(roles.id, role.id));
    }
  }

  async findRoleById(id: string): Promise<Role | null> {
    const result = await db.select().from(roles).where(eq(roles.id, id));
    if (result.length === 0) return null;

    const row = result[0];
    return Role.reconstruct({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      permissions: row.permissions as Record<string, string[]>,
      isSystem: row.isSystem ?? false,
      createdAt: row.createdAt ?? new Date(),
    });
  }

  async findRoleByName(name: string): Promise<Role | null> {
    const result = await db.select().from(roles).where(eq(roles.name, name));
    if (result.length === 0) return null;

    const row = result[0];
    return Role.reconstruct({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      permissions: row.permissions as Record<string, string[]>,
      isSystem: row.isSystem ?? false,
      createdAt: row.createdAt ?? new Date(),
    });
  }

  async findAllRoles(): Promise<Role[]> {
    const results = await db.select().from(roles).orderBy(desc(roles.createdAt));
    return results.map(row =>
      Role.reconstruct({
        id: row.id,
        name: row.name,
        description: row.description ?? undefined,
        permissions: row.permissions as Record<string, string[]>,
        isSystem: row.isSystem ?? false,
        createdAt: row.createdAt ?? new Date(),
      })
    );
  }

  async deleteRole(id: string): Promise<void> {
    await db.delete(roles).where(eq(roles.id, id));
  }

  // Refresh token operations
  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db.insert(refreshTokens).values({
      id: crypto.randomUUID(),
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    });
  }

  async findRefreshToken(token: string): Promise<{ userId: string, expiresAt: Date } | null> {
    const result = await db.select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token));

    if (result.length === 0) return null;

    const row = result[0];
    return {
      userId: row.userId,
      expiresAt: row.expiresAt,
    };
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteAllRefreshTokensForUser(userId: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }
}
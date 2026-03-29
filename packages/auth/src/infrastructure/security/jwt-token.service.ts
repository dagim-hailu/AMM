import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '../../domain/ports/token.service';

@Injectable()
export class JwtTokenService implements ITokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'development-access-secret-change-in-production';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'development-refresh-secret-change-in-production';
    
    if (!this.accessTokenSecret || this.accessTokenSecret === 'development-access-secret-change-in-production') {
      console.warn('WARNING: Using default JWT secret. Set JWT_SECRET environment variable in production.');
    }
    if (!this.refreshTokenSecret || this.refreshTokenSecret === 'development-refresh-secret-change-in-production') {
      console.warn('WARNING: Using default JWT refresh secret. Set JWT_REFRESH_SECRET environment variable in production.');
    }
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
    });
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}
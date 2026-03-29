export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
}

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): string;
  verifyAccessToken(token: string): TokenPayload | null;
  verifyRefreshToken(token: string): TokenPayload | null;
  decodeToken(token: string): TokenPayload | null;
}

export const ITokenService = Symbol('ITokenService');
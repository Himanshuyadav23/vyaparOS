import * as jwt from 'jsonwebtoken';

// Validate JWT_SECRET on module load
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
if (JWT_SECRET === 'your-secret-key-change-in-production' || JWT_SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to a secure random string (at least 32 characters) in production');
  }
  console.warn('⚠️  WARNING: Using default JWT_SECRET. Change this in production!');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions) as string;
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

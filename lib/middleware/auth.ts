import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest, generateToken } from '@/lib/auth/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
}

// Check if we're in development mode with SKIP_AUTH
function isDevMode(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true';
}

export function withAuth(
  handler: (req: AuthenticatedRequest, context?: { params?: Promise<{ [key: string]: string }> }) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: { params?: Promise<{ [key: string]: string }> }) => {
    // In dev mode with SKIP_AUTH, allow requests through with mock user
    if (isDevMode()) {
      (req as AuthenticatedRequest).user = {
        userId: 'dev-user-123',
        email: 'dev@vyaparos.com',
        role: 'admin',
      };
      return handler(req as AuthenticatedRequest, context);
    }

    const token = getTokenFromRequest(req);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    (req as AuthenticatedRequest).user = payload;
    return handler(req as AuthenticatedRequest, context);
  };
}

export function withOptionalAuth(
  handler: (req: AuthenticatedRequest, context?: { params?: Promise<{ [key: string]: string }> }) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: { params?: Promise<{ [key: string]: string }> }) => {
    // In dev mode with SKIP_AUTH, set mock user
    if (isDevMode()) {
      (req as AuthenticatedRequest).user = {
        userId: 'dev-user-123',
        email: 'dev@vyaparos.com',
        role: 'admin',
      };
      return handler(req as AuthenticatedRequest, context);
    }

    const token = getTokenFromRequest(req);
    
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        (req as AuthenticatedRequest).user = payload;
      }
    }

    return handler(req as AuthenticatedRequest, context);
  };
}


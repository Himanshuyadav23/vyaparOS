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
    // Always check for real token first - prioritize real authentication
    const token = getTokenFromRequest(req);
    
    if (token) {
      // If token exists, verify it and use real authentication
      const payload = verifyToken(token);
      
      if (payload) {
        (req as AuthenticatedRequest).user = payload;
        return handler(req as AuthenticatedRequest, context);
      }
      // Invalid token - return error (don't fall back to dev mode)
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // No token provided - only use dev mode if SKIP_AUTH is enabled
    if (isDevMode()) {
      (req as AuthenticatedRequest).user = {
        userId: 'dev-user-123',
        email: 'dev@vyaparos.com',
        role: 'admin',
      };
      return handler(req as AuthenticatedRequest, context);
    }

    // No token and no dev mode - require authentication
    return NextResponse.json(
      { error: 'Unauthorized - No token provided' },
      { status: 401 }
    );
  };
}

export function withOptionalAuth(
  handler: (req: AuthenticatedRequest, context?: { params?: Promise<{ [key: string]: string }> }) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: { params?: Promise<{ [key: string]: string }> }) => {
    // Always check for real token first - prioritize real authentication
    const token = getTokenFromRequest(req);
    
    if (token) {
      // If token exists, verify it and use real authentication
      const payload = verifyToken(token);
      if (payload) {
        (req as AuthenticatedRequest).user = payload;
        return handler(req as AuthenticatedRequest, context);
      }
      // Invalid token - continue without user (optional auth allows this)
    }

    // No token or invalid token - only use dev mode if SKIP_AUTH is enabled
    if (isDevMode()) {
      (req as AuthenticatedRequest).user = {
        userId: 'dev-user-123',
        email: 'dev@vyaparos.com',
        role: 'admin',
      };
    }

    return handler(req as AuthenticatedRequest, context);
  };
}


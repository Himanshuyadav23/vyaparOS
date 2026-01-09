import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/auth/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export function withAuth(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized - No token provided' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      try {
        const payload = verifyToken(token);
        (req as AuthenticatedRequest).user = payload;
        return handler(req as AuthenticatedRequest, context);
      } catch (error: any) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid token' },
          { status: 401 }
        );
      }
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}

export function withOptionalAuth(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization');
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const payload = verifyToken(token);
          (req as AuthenticatedRequest).user = payload;
        } catch (error) {
          // Invalid token, but continue without auth
          (req as AuthenticatedRequest).user = undefined;
        }
      }
      
      return handler(req as AuthenticatedRequest, context);
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Request error' },
        { status: 500 }
      );
    }
  };
}

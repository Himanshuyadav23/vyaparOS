/**
 * Rate Limiting Utility
 * Prevents brute force attacks and API abuse
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }

  private getKey(identifier: string, endpoint: string): string {
    return `${identifier}:${endpoint}`;
  }

  check(identifier: string, endpoint: string): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(identifier, endpoint);
    const now = Date.now();
    
    let entry = this.store[key];
    
    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.store[key] = entry;
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: entry.resetTime,
      };
    }
    
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }
    
    entry.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  reset(identifier: string, endpoint: string): void {
    const key = this.getKey(identifier, endpoint);
    delete this.store[key];
  }
}

// Create rate limiters for different endpoints
export const loginRateLimiter = new RateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(60000, 100); // 100 requests per minute
export const uploadRateLimiter = new RateLimiter(60000, 10); // 10 uploads per minute
export const registerRateLimiter = new RateLimiter(60 * 60 * 1000, 3); // 3 registrations per hour

/**
 * Get client identifier from request
 */
export function getClientIdentifier(req: Request | { headers: Headers }): string {
  // Try to get IP from various headers (for proxy/load balancer scenarios)
  const headers = req.headers;
  const forwarded = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  return ip.trim();
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  limiter: RateLimiter,
  getIdentifier: (req: Request) => string = getClientIdentifier
) {
  return (handler: (req: Request) => Promise<Response>) => {
    return async (req: Request, context?: any): Promise<Response> => {
      const identifier = getIdentifier(req);
      const url = new URL(req.url);
      const endpoint = url.pathname;
      
      const result = limiter.check(identifier, endpoint);
      
      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
        return new Response(
          JSON.stringify({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': '100',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            },
          }
        );
      }
      
      const response = await handler(req);
      
      // Add rate limit headers to response
      response.headers.set('X-RateLimit-Limit', '100');
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      
      return response;
    };
  };
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';
import { comparePassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { loginRateLimiter, getClientIdentifier } from '@/lib/security/rateLimiter';
import { accountLockout, getLockoutIdentifier } from '@/lib/security/accountLockout';
import { sanitizeEmail, isValidEmail } from '@/lib/security/validator';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Rate limiting
    const clientId = getClientIdentifier(req as any);
    const rateLimitResult = loginRateLimiter.check(clientId, '/api/auth/login');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts',
          message: 'Please try again later',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json();
    let { email, password } = body;

    // Validate and sanitize input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    email = sanitizeEmail(email);
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check account lockout
    const lockoutId = getLockoutIdentifier(email, clientId);
    const lockoutStatus = accountLockout.isLocked(lockoutId);
    
    if (lockoutStatus.locked) {
      const minutesLeft = Math.ceil((lockoutStatus.lockedUntil! - Date.now()) / 60000);
      return NextResponse.json(
        { 
          error: 'Account temporarily locked',
          message: `Too many failed login attempts. Please try again in ${minutesLeft} minute(s).`,
          retryAfter: Math.ceil((lockoutStatus.lockedUntil! - Date.now()) / 1000),
        },
        { status: 423 } // 423 Locked
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).exec();
    if (!user) {
      // Record failed attempt
      accountLockout.recordFailedAttempt(lockoutId);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Record failed attempt
      const attemptResult = accountLockout.recordFailedAttempt(lockoutId);
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          remainingAttempts: attemptResult.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Successful login - reset lockout
    accountLockout.recordSuccess(lockoutId);
    loginRateLimiter.reset(clientId, '/api/auth/login');

    // Ensure role is valid - if user has manufacturer businessType but invalid role, fix it
    const validRoles = ['wholesaler', 'retailer', 'manufacturer', 'admin'];
    if (user.businessType === 'manufacturer' && !validRoles.includes(user.role)) {
      user.role = 'manufacturer';
      await User.updateOne(
        { _id: user._id },
        { role: 'manufacturer', lastLoginAt: new Date() }
      );
    } else {
      // Update last login - use updateOne to avoid validation issues with cached schemas
      await User.updateOne(
        { _id: user._id },
        { lastLoginAt: new Date() }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.uid,
      email: user.email,
      role: user.role,
    });

    // Return user data (without password)
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      businessName: user.businessName,
      businessType: user.businessType,
      role: user.role,
      phone: user.phone,
      address: user.address,
      verified: user.verified,
    };

    return NextResponse.json({
      user: userData,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}


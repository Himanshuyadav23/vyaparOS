import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';
import { hashPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { v4 as uuidv4 } from 'uuid';
import { registerRateLimiter, getClientIdentifier } from '@/lib/security/rateLimiter';
import { 
  sanitizeEmail, 
  isValidEmail, 
  sanitizeString, 
  sanitizePhone, 
  isValidPhone,
  validatePasswordStrength,
  sanitizeObject,
} from '@/lib/security/validator';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Rate limiting
    const clientId = getClientIdentifier(req as any);
    const rateLimitResult = registerRateLimiter.check(clientId, '/api/auth/register');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many registration attempts',
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
    let { email, password, displayName, businessName, businessType, phone, address } = body;

    // Validate required fields
    if (!email || !password || !businessName || !businessType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Sanitize and validate email
    email = sanitizeEmail(email);
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          errors: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Sanitize other fields
    displayName = displayName ? sanitizeString(displayName) : undefined;
    businessName = sanitizeString(businessName);
    businessType = sanitizeString(businessType);
    phone = phone ? sanitizePhone(phone) : undefined;
    
    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Sanitize address if provided
    if (address && typeof address === 'object') {
      address = sanitizeObject(address);
    } else if (address && typeof address === 'string') {
      address = sanitizeString(address);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const uid = uuidv4();
    const user = new User({
      uid,
      email: email.toLowerCase(),
      password: hashedPassword,
      displayName,
      businessName,
      businessType,
      role: businessType === 'admin' ? 'admin' : businessType,
      phone,
      address,
      verified: false,
    });

    await user.save();

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

    return NextResponse.json(
      {
        user: userData,
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}









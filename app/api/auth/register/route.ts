import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';
import { hashPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password, displayName, businessName, businessType, phone, address } = body;

    if (!email || !password || !businessName || !businessType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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









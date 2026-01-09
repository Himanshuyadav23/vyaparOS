import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';
import { comparePassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).exec();
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

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


import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';

async function handler(req: any) {
  try {
    await connectDB();

    const user = await User.findOne({ uid: req.user.userId }).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is banned
    if (user.banned) {
      return NextResponse.json(
        { error: 'Account has been banned. Please contact support.', banned: true },
        { status: 403 }
      );
    }

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
      banned: user.banned || false,
      banReason: user.banReason,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };

    return NextResponse.json({ user: userData });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);


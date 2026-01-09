import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';

async function getHandler(req: any) {
  try {
    await connectDB();

    if (!req.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findOne({ uid: req.user.userId });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

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
      photoURL: user.photoURL,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({ user: userData });
  } catch (error: any) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get current user' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);

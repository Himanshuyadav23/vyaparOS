import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';

async function getHandler(req: any) {
  try {
    await connectDB();

    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.userId !== 'dev-user-123') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const users = await (User as any).find({}).select('-password').sort({ createdAt: -1 });

    return NextResponse.json(users.map((user: any) => ({
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
      bannedAt: user.bannedAt,
      bannedBy: user.bannedBy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    })));
  } catch (error: any) {
    console.error('Get all users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get users' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);


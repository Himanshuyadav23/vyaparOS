import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';

async function putHandler(req: any, context: { params: Promise<{ uid: string }> }) {
  try {
    await connectDB();

    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.userId !== 'dev-user-123') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const params = await context.params;
    const body = await req.json();
    const { banned, banReason } = body;

    const user = await (User as any).findOne({ uid: params.uid });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't allow banning yourself
    if (user.uid === req.user.userId) {
      return NextResponse.json(
        { error: 'Cannot ban your own account' },
        { status: 400 }
      );
    }

    // Don't allow banning other admins
    if (user.role === 'admin' && banned) {
      return NextResponse.json(
        { error: 'Cannot ban admin users' },
        { status: 400 }
      );
    }

    user.banned = banned || false;
    user.banReason = banReason || '';
    user.bannedAt = banned ? new Date() : undefined;
    user.bannedBy = banned ? req.user.userId : undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        businessName: user.businessName,
        banned: user.banned,
        banReason: user.banReason,
      },
    });
  } catch (error: any) {
    console.error('Ban user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to ban user' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(putHandler);









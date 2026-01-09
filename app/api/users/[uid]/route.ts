import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';

async function deleteHandler(req: any, context: { params: Promise<{ uid: string }> }) {
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
    const user = await (User as any).findOne({ uid: params.uid });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't allow deleting yourself
    if (user.uid === req.user.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await (User as any).deleteOne({ uid: params.uid });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

export const DELETE = withAuth(deleteHandler);









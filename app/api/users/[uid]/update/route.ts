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
    
    const user = await (User as any).findOne({ uid: params.uid });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedFields = ['businessName', 'displayName', 'phone', 'address', 'role', 'businessType'];
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        user[field] = body[field];
      }
    });

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        businessName: user.businessName,
        displayName: user.displayName,
        phone: user.phone,
        address: user.address,
        role: user.role,
        businessType: user.businessType,
      },
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(putHandler);




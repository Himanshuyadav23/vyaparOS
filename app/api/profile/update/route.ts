import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';

async function putHandler(req: any) {
  try {
    await connectDB();

    if (!req.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const userId = req.user.userId;
    
    const user = await (User as any).findOne({ uid: userId });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Users can only update their own profile
    // Update allowed fields (users cannot change email, role, businessType, verified status)
    const allowedFields = ['businessName', 'displayName', 'phone', 'address'];
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
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(putHandler);

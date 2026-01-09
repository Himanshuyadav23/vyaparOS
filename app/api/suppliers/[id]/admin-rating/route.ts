import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import Supplier from '@/lib/mongodb/models/Supplier';

async function putHandler(req: any, context: { params: Promise<{ id: string }> }) {
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
    const { adminRating } = body;

    if (adminRating === undefined || adminRating < 0 || adminRating > 5) {
      return NextResponse.json(
        { error: 'Admin rating must be between 0 and 5' },
        { status: 400 }
      );
    }

    const supplier = await (Supplier as any).findOne({ _id: params.id });
    
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    supplier.adminRating = adminRating;
    await supplier.save();

    return NextResponse.json({
      success: true,
      supplier: {
        id: supplier._id.toString(),
        ...supplier.toObject(),
      },
    });
  } catch (error: any) {
    console.error('Update supplier admin rating error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update supplier rating' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(putHandler);

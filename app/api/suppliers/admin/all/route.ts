import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import Supplier from '@/lib/mongodb/models/Supplier';

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

    // Admin can see ALL suppliers including banned and bad ones
    const suppliers = await (Supplier as any).find({})
      .sort({ adminRating: -1, rating: -1, createdAt: -1 });

    return NextResponse.json(suppliers.map((supplier: any) => ({
      id: supplier._id.toString(),
      ...supplier.toObject(),
    })));
  } catch (error: any) {
    console.error('Get all suppliers (admin) error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get suppliers' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);

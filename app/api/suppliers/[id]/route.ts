import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import Supplier from '@/lib/mongodb/models/Supplier';

async function getHandler(req: any, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const params = await context.params;
    const supplier = await (Supplier as any).findById(params.id);
    
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: supplier._id.toString(),
      ...supplier.toObject(),
    });
  } catch (error: any) {
    console.error('Get supplier error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get supplier' },
      { status: 500 }
    );
  }
}

async function putHandler(req: any, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    if (!req.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const supplier = await (Supplier as any).findById(params.id);
    
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (supplier.userId !== req.user.userId && req.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData: any = { ...body };
    delete updateData.userId;

    Object.assign(supplier, updateData);
    await supplier.save();

    return NextResponse.json({
      id: supplier._id.toString(),
      ...supplier.toObject(),
    });
  } catch (error: any) {
    console.error('Update supplier error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

async function deleteHandler(req: any, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    if (!req.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const supplier = await (Supplier as any).findById(params.id);
    
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (supplier.userId !== req.user.userId && req.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await (Supplier as any).deleteOne({ _id: params.id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete supplier error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getHandler);
export const PUT = withOptionalAuth(putHandler);
export const DELETE = withOptionalAuth(deleteHandler);


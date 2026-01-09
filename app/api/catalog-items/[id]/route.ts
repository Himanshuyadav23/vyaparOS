import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import CatalogItem from '@/lib/mongodb/models/CatalogItem';

async function getHandler(req: any, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    await connectDB();

    const item = await CatalogItem.findOne({ catalogId: params.id });
    
    if (!item) {
      return NextResponse.json(
        { error: 'Catalog item not found' },
        { status: 404 }
      );
    }

    // Increment views
    item.views = (item.views || 0) + 1;
    await item.save();

    return NextResponse.json({
      id: item.catalogId,
      catalogId: item.catalogId,
      ...item.toObject(),
    });
  } catch (error: any) {
    console.error('Get catalog item error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get catalog item' },
      { status: 500 }
    );
  }
}

async function putHandler(req: any, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    await connectDB();

    if (!req.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const item = await CatalogItem.findOne({ catalogId: params.id });
    
    if (!item) {
      return NextResponse.json(
        { error: 'Catalog item not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (item.supplierId !== req.user.userId && req.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData: any = { ...body };
    delete updateData.catalogId;
    delete updateData.supplierId;
    delete updateData.supplierName;

    Object.assign(item, updateData);
    await item.save();

    return NextResponse.json({
      id: item.catalogId,
      catalogId: item.catalogId,
      ...item.toObject(),
    });
  } catch (error: any) {
    console.error('Update catalog item error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update catalog item' },
      { status: 500 }
    );
  }
}

async function deleteHandler(req: any, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    await connectDB();

    if (!req.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const item = await CatalogItem.findOne({ catalogId: params.id });
    
    if (!item) {
      return NextResponse.json(
        { error: 'Catalog item not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (item.supplierId !== req.user.userId && req.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await CatalogItem.deleteOne({ catalogId: params.id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete catalog item error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete catalog item' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getHandler);
export const PUT = withOptionalAuth(putHandler);
export const DELETE = withOptionalAuth(deleteHandler);


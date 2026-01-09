import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import Shop from '@/lib/mongodb/models/Shop';

async function getHandler(req: any, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const params = await context.params;
    const shop = await Shop.findOne({ shopId: params.id });
    
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      shopId: shop.shopId,
      ...shop.toObject(),
    });
  } catch (error: any) {
    console.error('Get shop error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get shop' },
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
    const shop = await Shop.findOne({ shopId: params.id });
    
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (shop.ownerId !== req.user.userId && req.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData: any = { ...body };
    delete updateData.shopId;
    delete updateData.ownerId;

    Object.assign(shop, updateData);
    await shop.save();

    return NextResponse.json({
      shopId: shop.shopId,
      ...shop.toObject(),
    });
  } catch (error: any) {
    console.error('Update shop error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update shop' },
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
    const shop = await Shop.findOne({ shopId: params.id });
    
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (shop.ownerId !== req.user.userId && req.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await Shop.deleteOne({ shopId: params.id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete shop error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete shop' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getHandler);
export const PUT = withOptionalAuth(putHandler);
export const DELETE = withOptionalAuth(deleteHandler);









import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import DeadStockListing from '@/lib/mongodb/models/DeadStockListing';

async function getHandler(req: any, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    await connectDB();

    const listing = await DeadStockListing.findOne({ listingId: params.id });
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Dead stock listing not found' },
        { status: 404 }
      );
    }

    // Increment views
    listing.views = (listing.views || 0) + 1;
    await listing.save();

    return NextResponse.json({
      id: listing.listingId,
      listingId: listing.listingId,
      ...listing.toObject(),
    });
  } catch (error: any) {
    console.error('Get dead stock listing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get dead stock listing' },
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

    const listing = await DeadStockListing.findOne({ listingId: params.id });
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Dead stock listing not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (listing.sellerId !== req.user.userId && req.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData: any = { ...body };
    delete updateData.listingId;
    delete updateData.sellerId;
    delete updateData.sellerName;

    // Recalculate discount percent if prices changed
    if (updateData.originalPrice && updateData.discountPrice) {
      updateData.discountPercent = ((updateData.originalPrice - updateData.discountPrice) / updateData.originalPrice) * 100;
    }

    Object.assign(listing, updateData);
    await listing.save();

    return NextResponse.json({
      id: listing.listingId,
      listingId: listing.listingId,
      ...listing.toObject(),
    });
  } catch (error: any) {
    console.error('Update dead stock listing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update dead stock listing' },
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

    const listing = await DeadStockListing.findOne({ listingId: params.id });
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Dead stock listing not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (listing.sellerId !== req.user.userId && req.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await DeadStockListing.deleteOne({ listingId: params.id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete dead stock listing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete dead stock listing' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getHandler);
export const PUT = withOptionalAuth(putHandler);
export const DELETE = withOptionalAuth(deleteHandler);


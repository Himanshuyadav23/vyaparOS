import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';
import CatalogItem from '@/lib/mongodb/models/CatalogItem';
import DeadStockListing from '@/lib/mongodb/models/DeadStockListing';

async function postHandler(req: any) {
  try {
    await connectDB();

    if (!req.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { listingId, listingType } = body;

    if (!listingId || !listingType) {
      return NextResponse.json(
        { error: 'Listing ID and type are required' },
        { status: 400 }
      );
    }

    // Get the listing
    let listing;
    if (listingType === 'catalog') {
      listing = await (CatalogItem as any).findOne({ catalogId: listingId, supplierId: req.user.userId });
    } else {
      listing = await (DeadStockListing as any).findOne({ listingId, sellerId: req.user.userId });
    }

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found or you do not own it' },
        { status: 404 }
      );
    }

    if (!listing.isFeatured) {
      return NextResponse.json(
        { error: 'This listing is not featured' },
        { status: 400 }
      );
    }

    // Unfeature the listing
    listing.isFeatured = false;
    await listing.save();

    // Increment featured listings count back
    const user = await (User as any).findOne({ uid: req.user.userId });
    if (user && user.isPremium) {
      user.featuredListingsCount = Math.min(10, user.featuredListingsCount + 1);
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Listing unfeatured successfully!',
      featuredListingsRemaining: user?.featuredListingsCount || 0,
    });
  } catch (error: any) {
    console.error('Unfeature listing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unfeature listing' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler);

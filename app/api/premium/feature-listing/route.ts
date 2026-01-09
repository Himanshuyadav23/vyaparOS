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
    const { listingId, listingType } = body; // listingType: 'catalog' | 'deadstock'

    if (!listingId || !listingType) {
      return NextResponse.json(
        { error: 'Listing ID and type are required' },
        { status: 400 }
      );
    }

    const user = await (User as any).findOne({ uid: req.user.userId });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has premium subscription
    if (!user.isPremium || (user.premiumExpiresAt && new Date(user.premiumExpiresAt) < new Date())) {
      return NextResponse.json(
        { error: 'Premium subscription required. Please subscribe to premium to feature listings.' },
        { status: 403 }
      );
    }

    // Check if user has remaining featured listings
    if (user.featuredListingsCount <= 0) {
      return NextResponse.json(
        { error: 'You have used all your featured listings. Upgrade your plan for more.' },
        { status: 403 }
      );
    }

    // Get the listing
    let listing;
    if (listingType === 'catalog') {
      listing = await (CatalogItem as any).findOne({ catalogId: listingId, supplierId: user.uid });
      if (!listing) {
        return NextResponse.json(
          { error: 'Catalog item not found or you do not own it' },
          { status: 404 }
        );
      }
    } else {
      listing = await (DeadStockListing as any).findOne({ listingId, sellerId: user.uid });
      if (!listing) {
        return NextResponse.json(
          { error: 'Dead stock listing not found or you do not own it' },
          { status: 404 }
        );
      }
    }

    // Check if already featured
    if (listing.isFeatured) {
      return NextResponse.json(
        { error: 'This listing is already featured' },
        { status: 400 }
      );
    }

    // Feature the listing
    listing.isFeatured = true;
    await listing.save();

    // Decrement featured listings count
    user.featuredListingsCount = Math.max(0, user.featuredListingsCount - 1);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Listing featured successfully!',
      featuredListingsRemaining: user.featuredListingsCount,
    });
  } catch (error: any) {
    console.error('Feature listing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to feature listing' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler);

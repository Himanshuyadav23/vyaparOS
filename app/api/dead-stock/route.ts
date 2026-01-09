import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import DeadStockListing from '@/lib/mongodb/models/DeadStockListing';
import { v4 as uuidv4 } from 'uuid';

async function getHandler(req: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    const query: any = {};

    if (sellerId) query.sellerId = sellerId;
    if (category) query.category = category;
    if (status) query.status = status;
    if (city) query['location.city'] = city;
    if (state) query['location.state'] = state;

    const listings = await (DeadStockListing as any).find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json(listings.map((listing) => ({
      id: listing.listingId,
      listingId: listing.listingId,
      ...listing.toObject(),
    })));
  } catch (error: any) {
    console.error('Get dead stock listings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get dead stock listings' },
      { status: 500 }
    );
  }
}

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
    const {
      productName,
      category,
      description,
      quantity,
      originalPrice,
      discountPrice,
      condition,
      images,
      location,
      shopId,
      expiresAt,
    } = body;

    // Get user info
    const User = (await import('@/lib/mongodb/models/User')).default;
    let user = await (User as any).findOne({ uid: req.user.userId });

    // In dev mode, create user if it doesn't exist
    if (!user && req.user.userId === 'dev-user-123') {
      user = new User({
        uid: 'dev-user-123',
        email: 'dev@vyaparos.com',
        password: 'dev-password-hash', // Not used in dev mode
        businessName: 'Dev Business',
        businessType: 'wholesaler',
        role: 'admin',
        verified: true,
      });
      await user.save();
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const discountPercent = ((originalPrice - discountPrice) / originalPrice) * 100;

    const listingId = uuidv4();
    const listing = new DeadStockListing({
      listingId,
      sellerId: user.uid,
      sellerName: user.businessName,
      shopId,
      productName,
      category,
      description,
      quantity,
      originalPrice,
      discountPrice,
      discountPercent,
      condition: condition || 'new',
      images: images || [],
      location: location || {
        city: user.address?.city || '',
        state: user.address?.state || '',
      },
      status: 'available',
      views: 0,
      inquiries: 0,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    await listing.save();

    return NextResponse.json(
      { id: listing.listingId, listingId: listing.listingId, ...listing.toObject() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create dead stock listing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create dead stock listing' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getHandler);
export const POST = withOptionalAuth(postHandler);


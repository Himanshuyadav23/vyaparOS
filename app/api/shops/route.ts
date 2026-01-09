import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import Shop from '@/lib/mongodb/models/Shop';
import { v4 as uuidv4 } from 'uuid';

async function getHandler(req: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const shopType = searchParams.get('shopType');
    const verified = searchParams.get('verified');
    const isActive = searchParams.get('isActive');

    const query: any = {};

    if (ownerId) query.ownerId = ownerId;
    if (city) query['address.city'] = city;
    if (state) query['address.state'] = state;
    if (shopType) query.shopType = shopType;
    if (verified !== null) query.verified = verified === 'true';
    if (isActive !== null) query.isActive = isActive === 'true';

    const shops = await Shop.find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json(shops.map((shop) => ({
      shopId: shop.shopId,
      ...shop.toObject(),
    })));
  } catch (error: any) {
    console.error('Get shops error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get shops' },
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
      shopName,
      shopType,
      address,
      contact,
      businessHours,
      categories,
      specialties,
    } = body;

    const shopId = uuidv4();
    const shop = new Shop({
      shopId,
      ownerId: req.user.userId,
      shopName,
      shopType: shopType || 'wholesale',
      address: {
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        pincode: address?.pincode || '',
        country: address?.country || 'India',
        coordinates: address?.coordinates,
      },
      contact: {
        phone: contact?.phone || '',
        email: contact?.email,
        alternatePhone: contact?.alternatePhone,
      },
      businessHours,
      categories: categories || [],
      specialties: specialties || [],
      rating: 0,
      totalRatings: 0,
      verified: false,
      isActive: true,
    });

    await shop.save();

    return NextResponse.json(
      { shopId: shop.shopId, ...shop.toObject() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create shop error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create shop' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getHandler);
export const POST = withOptionalAuth(postHandler);









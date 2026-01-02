import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import CatalogItem from '@/lib/mongodb/models/CatalogItem';
import { v4 as uuidv4 } from 'uuid';

async function getHandler(req: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');
    const shopId = searchParams.get('shopId');
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const isFeatured = searchParams.get('isFeatured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const limit = searchParams.get('limit');

    const query: any = {};

    if (supplierId) query.supplierId = supplierId;
    if (shopId) query.shopId = shopId;
    if (category) query.category = category;
    if (isActive !== null) query.isActive = isActive === 'true';
    if (isFeatured !== null) query.isFeatured = isFeatured === 'true';
    if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };

    let itemsQuery = (CatalogItem as any).find(query).sort({ createdAt: -1 });
    
    if (limit) {
      itemsQuery = itemsQuery.limit(Number(limit));
    }

    const items = await itemsQuery;

    const itemsData = items.map((item) => ({
      id: item.catalogId,
      catalogId: item.catalogId,
      supplierId: item.supplierId,
      supplierName: item.supplierName,
      shopId: item.shopId,
      productId: item.productId,
      productName: item.productName,
      category: item.category,
      subcategory: item.subcategory,
      description: item.description,
      price: item.price,
      minOrderQuantity: item.minOrderQuantity,
      maxOrderQuantity: item.maxOrderQuantity,
      stockAvailable: item.stockAvailable,
      unit: item.unit,
      images: item.images,
      specifications: item.specifications,
      tags: item.tags,
      isActive: item.isActive,
      isFeatured: item.isFeatured,
      views: item.views,
      inquiries: item.inquiries,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return NextResponse.json(itemsData);
  } catch (error: any) {
    console.error('Get catalog items error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get catalog items' },
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
      subcategory,
      description,
      price,
      minOrderQuantity,
      maxOrderQuantity,
      stockAvailable,
      unit,
      images,
      specifications,
      tags,
      isActive,
      isFeatured,
      shopId,
    } = body;

    // Get user info for supplier details
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

    const catalogId = uuidv4();
    const catalogItem = new CatalogItem({
      catalogId,
      supplierId: user.uid,
      supplierName: user.businessName,
      shopId,
      productName,
      category,
      subcategory,
      description,
      price,
      minOrderQuantity: minOrderQuantity || 1,
      maxOrderQuantity,
      stockAvailable: stockAvailable || 0,
      unit: unit || 'units',
      images: images || [],
      specifications: specifications || {},
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      views: 0,
      inquiries: 0,
    });

    await catalogItem.save();

    return NextResponse.json(
      { id: catalogItem.catalogId, ...catalogItem.toObject() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create catalog item error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create catalog item' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getHandler);
export const POST = withOptionalAuth(postHandler);


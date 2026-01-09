import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import { v4 as uuidv4 } from 'uuid';

// Simple in-memory store for inquiries (in production, use MongoDB)
// For now, we'll just log inquiries and return success
const inquiries: any[] = [];

async function postHandler(req: any) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      listingId,
      listingType, // 'deadstock' or 'catalog'
      sellerId,
      sellerName,
      buyerId,
      buyerName,
      buyerEmail,
      buyerPhone,
      message,
      productName,
    } = body;

    if (!listingId || !sellerId || !buyerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create inquiry record
    const inquiry = {
      id: uuidv4(),
      listingId,
      listingType,
      sellerId,
      sellerName,
      buyerId: buyerId || 'anonymous',
      buyerName,
      buyerEmail,
      buyerPhone,
      message: message || `Interested in ${productName}`,
      productName,
      status: 'pending',
      createdAt: new Date(),
    };

    inquiries.push(inquiry);

    // In production, save to MongoDB Inquiry collection
    // For now, we'll just return success with contact info

    return NextResponse.json({
      success: true,
      message: 'Inquiry sent successfully!',
      inquiry,
      contactInfo: {
        sellerName,
        sellerId,
        note: 'The seller will contact you soon via email or phone',
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create inquiry error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create inquiry' },
      { status: 500 }
    );
  }
}

async function getHandler(req: any) {
  try {
    // Get inquiries for the current user (if logged in)
    if (!req.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');

    const userInquiries = inquiries.filter(
      (inq) => inq.sellerId === req.user.userId || inq.buyerId === req.user.userId
    );

    return NextResponse.json(userInquiries);
  } catch (error: any) {
    console.error('Get inquiries error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get inquiries' },
      { status: 500 }
    );
  }
}

export const POST = withOptionalAuth(postHandler);
export const GET = withOptionalAuth(getHandler);









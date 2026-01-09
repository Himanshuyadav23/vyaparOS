import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';

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
    const { paymentId, paymentMethod } = body;

    // In production, verify payment with payment gateway (Razorpay, Stripe, etc.)
    // For now, we'll accept the payment and activate premium
    // You should verify paymentId with your payment gateway before proceeding

    const user = await (User as any).findOne({ uid: req.user.userId });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate premium expiry (30 days from now)
    const premiumExpiresAt = new Date();
    premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);

    // Activate premium subscription
    user.isPremium = true;
    user.premiumExpiresAt = premiumExpiresAt;
    user.featuredListingsCount = 10; // 10 featured listings
    user.featuredSellerCount = 1; // 1 featured seller slot

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Premium subscription activated successfully!',
      premium: {
        isPremium: true,
        premiumExpiresAt: user.premiumExpiresAt,
        featuredListingsCount: user.featuredListingsCount,
        featuredSellerCount: user.featuredSellerCount,
      },
    });
  } catch (error: any) {
    console.error('Premium subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to activate premium subscription' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler);

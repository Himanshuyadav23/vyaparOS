import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connect';
import User, { IUser } from '@/lib/mongodb/models/User';
import { generateToken } from '@/lib/auth/jwt';
import { v4 as uuidv4 } from 'uuid';

// Verify Google token using Google's API
async function verifyGoogleToken(token: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
    );
    
    if (!response.ok) {
      throw new Error('Invalid token');
    }
    
    const data = await response.json();
    
    // Verify the token is from our app
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (data.aud !== clientId) {
      throw new Error('Token audience mismatch');
    }
    
    return {
      email: data.email,
      name: data.name,
      picture: data.picture,
      emailVerified: data.email_verified === 'true',
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Failed to verify Google token');
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { idToken, isSignUp } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: 'Google token is required' },
        { status: 400 }
      );
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(idToken);

    // Check if user exists
    let user = await (User as any).findOne({ email: googleUser.email.toLowerCase() }).exec() as IUser | null;

    if (!user) {
      if (!isSignUp) {
        return NextResponse.json(
          { error: 'Account not found. Please sign up first.' },
          { status: 404 }
        );
      }

      // Create new user
      const uid = uuidv4();
      user = new User({
        uid,
        email: googleUser.email.toLowerCase(),
        password: '', // No password for Google users
        displayName: googleUser.name,
        businessName: googleUser.name || 'New Business',
        businessType: 'wholesaler',
        role: 'wholesaler',
        verified: googleUser.emailVerified,
      });

      await user.save();
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      if (googleUser.name && !user.displayName) {
        user.displayName = googleUser.name;
      }
      await user.save();
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.uid,
      email: user.email,
      role: user.role,
    });

    // Return user data (without password)
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      businessName: user.businessName,
      businessType: user.businessType,
      role: user.role,
      phone: user.phone,
      address: user.address,
      verified: user.verified,
    };

    return NextResponse.json({
      user: userData,
      token,
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Google authentication failed' },
      { status: 500 }
    );
  }
}


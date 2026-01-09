import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";

export async function GET(
  request: Request,
  context: { params: Promise<{ uid: string }> }
) {
  try {
    await connectDB();
    
    const params = await context.params;
    const user = await User.findOne({ uid: params.uid }).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };

    return NextResponse.json(userData);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import Supplier from '@/lib/mongodb/models/Supplier';
import { v4 as uuidv4 } from 'uuid';

async function getHandler(req: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const verified = searchParams.get('verified');
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    const query: any = {
      banned: { $ne: true }, // Exclude banned suppliers
      badSupplier: { $ne: true }, // Exclude bad suppliers
    };

    if (category) query.categories = { $in: [category] };
    if (verified !== null) query.verified = verified === 'true';
    if (city) query.city = city;
    if (state) query.state = state;

    const suppliers = await (Supplier as any).find(query)
      .sort({ adminRating: -1, rating: -1, createdAt: -1 }); // Sort by admin rating first, then regular rating

    return NextResponse.json(suppliers.map((supplier: any) => ({
      id: supplier._id.toString(),
      ...supplier.toObject(),
    })));
  } catch (error: any) {
    console.error('Get suppliers error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get suppliers' },
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
      businessName,
      contactPerson,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      categories,
      specialties,
    } = body;

    // Validate required fields (trim whitespace and check)
    const trimmedBusinessName = businessName?.trim();
    const trimmedContactPerson = contactPerson?.trim();
    const trimmedEmail = email?.trim();
    const trimmedPhone = phone?.trim();
    const trimmedAddress = address?.trim();
    const trimmedCity = city?.trim();
    const trimmedState = state?.trim();
    const trimmedPincode = pincode?.trim();

    if (!trimmedBusinessName || !trimmedContactPerson || !trimmedEmail || !trimmedPhone || 
        !trimmedAddress || !trimmedCity || !trimmedState || !trimmedPincode) {
      return NextResponse.json(
        { error: 'All required fields must be provided: Business Name, Contact Person, Email, Phone, Address, City, State, and Pincode' },
        { status: 400 }
      );
    }

    // Check if supplier already exists for this user
    const existing = await (Supplier as any).findOne({ userId: req.user.userId, email });
    if (existing) {
      return NextResponse.json(
        { error: 'Supplier with this email already exists' },
        { status: 400 }
      );
    }

    const supplier = new Supplier({
      userId: req.user.userId,
      businessName: trimmedBusinessName,
      contactPerson: trimmedContactPerson,
      email: trimmedEmail.toLowerCase(),
      phone: trimmedPhone,
      address: trimmedAddress,
      city: trimmedCity,
      state: trimmedState,
      pincode: trimmedPincode,
      categories: categories || [],
      specialties: specialties || [],
      rating: 0,
      totalTransactions: 0,
      verified: false,
    });

    await supplier.save();

    return NextResponse.json(
      { id: supplier._id.toString(), ...supplier.toObject() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create supplier error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create supplier' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getHandler);
export const POST = withOptionalAuth(postHandler);


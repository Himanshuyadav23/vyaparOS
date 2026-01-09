import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import Shop from "@/lib/mongodb/models/Shop";
import CatalogItem from "@/lib/mongodb/models/CatalogItem";
import DeadStockListing from "@/lib/mongodb/models/DeadStockListing";
import Supplier from "@/lib/mongodb/models/Supplier";
import { hashPassword } from "@/lib/auth/password";
import { v4 as uuidv4 } from 'uuid';

// Central Indian cities and states
const CENTRAL_INDIAN_CITIES = [
  { city: "Indore", state: "Madhya Pradesh" },
  { city: "Bhopal", state: "Madhya Pradesh" },
  { city: "Jabalpur", state: "Madhya Pradesh" },
  { city: "Gwalior", state: "Madhya Pradesh" },
  { city: "Raipur", state: "Chhattisgarh" },
  { city: "Bhilai", state: "Chhattisgarh" },
  { city: "Nagpur", state: "Maharashtra" },
  { city: "Aurangabad", state: "Maharashtra" },
];

// Central Indian business names
const WHOLESALER_NAMES = [
  "Shri Ganesh Textiles",
  "Madhya Pradesh Wholesale Mart",
  "Central India Fabrics",
  "Indore Textile Traders",
  "Bhopal Wholesale Hub",
  "Jabalpur Textile Suppliers",
  "Gwalior Fabric House",
  "Raipur Wholesale Center",
  "Bhilai Textile Emporium",
  "Nagpur Wholesale Traders",
];

const RETAILER_NAMES = [
  "Shree Ram Textiles",
  "Krishna Cloth House",
  "Lakshmi Fabric Store",
  "Sai Textile Mart",
  "Om Textiles",
  "Radha Cloth Center",
  "Ganesh Fabric Shop",
];

const CATEGORIES = ["Cotton", "Silk", "Denim", "Polyester", "Linen", "Wool", "Chiffon", "Georgette"];
const PRODUCT_NAMES = [
  "Premium Cotton Fabric",
  "Silk Saree Material",
  "Denim Fabric",
  "Cotton Shirt Material",
  "Polyester Blend",
  "Linen Fabric",
  "Chiffon Saree Material",
  "Georgette Fabric",
];

export async function POST(request: Request) {
  try {
    await connectDB();

    const hashedPassword = await hashPassword("password123"); // Default password for all mock users

    const results = {
      wholesalers: [] as string[],
      retailers: [] as string[],
      shops: [] as string[],
      catalogItems: [] as string[],
      deadStockListings: [] as string[],
      suppliers: [] as string[],
    };

    // Create 10 Wholesalers
    for (let i = 0; i < 10; i++) {
      const location = CENTRAL_INDIAN_CITIES[i % CENTRAL_INDIAN_CITIES.length];
      const businessName = WHOLESALER_NAMES[i];
      const email = `wholesaler${i + 1}@vyaparos.com`;
      const uid = `wholesaler_${uuidv4()}`;

      // Create user
      const user = new User({
        uid,
        email,
        password: hashedPassword,
        displayName: businessName.split(' ')[0] + " " + businessName.split(' ')[1],
        businessName,
        businessType: "wholesaler",
        role: "wholesaler",
        phone: `+91 ${9000000000 + i}`,
        address: {
          street: `${Math.floor(Math.random() * 999) + 1} Main Market`,
          city: location.city,
          state: location.state,
          pincode: `${450000 + i}`,
          country: "India",
        },
        verified: true,
      });

      try {
        await user.save();
        results.wholesalers.push(uid);
      } catch (error: any) {
        // Skip if user already exists
        if (error.code === 11000) {
          console.log(`User ${email} already exists, skipping...`);
          continue;
        }
        throw error;
      }

      // Create shop for wholesaler
      const shopId = uuidv4();
      const shop = new Shop({
        shopId,
        ownerId: uid,
        shopName: businessName,
        shopType: "wholesale",
        address: {
          street: `${Math.floor(Math.random() * 999) + 1} Textile Market`,
          city: location.city,
          state: location.state,
          pincode: `${450000 + i}`,
          country: "India",
        },
        contact: {
          phone: `+91 ${9000000000 + i}`,
          email,
        },
        categories: [CATEGORIES[i % CATEGORIES.length], CATEGORIES[(i + 1) % CATEGORIES.length]],
        specialties: ["Bulk Orders", "Fast Delivery", "Premium Quality"],
        rating: 4.0 + Math.random() * 1.0,
        totalRatings: Math.floor(Math.random() * 50) + 10,
        verified: true,
        isActive: true,
      });

      await shop.save();
      results.shops.push(shopId);

      // Create 3-5 catalog items per wholesaler
      const numItems = Math.floor(Math.random() * 3) + 3;
      for (let j = 0; j < numItems; j++) {
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const productName = `${category} ${PRODUCT_NAMES[Math.floor(Math.random() * PRODUCT_NAMES.length)]}`;
        
        const catalogItem = new CatalogItem({
          catalogId: uuidv4(),
          supplierId: uid,
          supplierName: businessName,
          shopId,
          productName,
          category,
          description: `High quality ${category.toLowerCase()} fabric from ${location.city}, perfect for wholesale orders`,
          price: Math.floor(Math.random() * 200) + 50,
          minOrderQuantity: Math.floor(Math.random() * 50) + 10,
          stockAvailable: Math.floor(Math.random() * 5000) + 1000,
          unit: "meters",
          images: [],
          specifications: {
            weight: `${100 + Math.floor(Math.random() * 100)} GSM`,
            width: `${40 + Math.floor(Math.random() * 20)} inches`,
          },
          tags: [category.toLowerCase(), "wholesale", location.city.toLowerCase()],
          isActive: true,
          views: Math.floor(Math.random() * 200),
          inquiries: Math.floor(Math.random() * 30),
        });

        await catalogItem.save();
        results.catalogItems.push(catalogItem.catalogId);
      }

      // Create 1-2 dead stock listings per wholesaler
      const numDeadStock = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < numDeadStock; j++) {
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const originalPrice = Math.floor(Math.random() * 200) + 100;
        const discountPrice = Math.floor(originalPrice * 0.7);
        const discountPercent = ((originalPrice - discountPrice) / originalPrice) * 100;

        const deadStock = new DeadStockListing({
          listingId: uuidv4(),
          sellerId: uid,
          sellerName: businessName,
          shopId,
          productName: `Clearance ${category} Fabric`,
          category,
          description: `Clearance sale of premium ${category.toLowerCase()} fabric. Limited stock available!`,
          quantity: Math.floor(Math.random() * 500) + 100,
          originalPrice,
          discountPrice,
          discountPercent,
          condition: ["new", "like_new", "good"][Math.floor(Math.random() * 3)] as any,
          images: [],
          location: {
            city: location.city,
            state: location.state,
          },
          status: "available",
          views: Math.floor(Math.random() * 100),
          inquiries: Math.floor(Math.random() * 15),
        });

        await deadStock.save();
        results.deadStockListings.push(deadStock.listingId);
      }
    }

    // Create 7 Retailers
    for (let i = 0; i < 7; i++) {
      const location = CENTRAL_INDIAN_CITIES[i % CENTRAL_INDIAN_CITIES.length];
      const businessName = RETAILER_NAMES[i];
      const email = `retailer${i + 1}@vyaparos.com`;
      const uid = `retailer_${uuidv4()}`;

      // Create user
      const user = new User({
        uid,
        email,
        password: hashedPassword,
        displayName: businessName.split(' ')[0] + " " + businessName.split(' ')[1],
        businessName,
        businessType: "retailer",
        role: "retailer",
        phone: `+91 ${8000000000 + i}`,
        address: {
          street: `${Math.floor(Math.random() * 999) + 1} Market Street`,
          city: location.city,
          state: location.state,
          pincode: `${450000 + 10 + i}`,
          country: "India",
        },
        verified: true,
      });

      try {
        await user.save();
        results.retailers.push(uid);
      } catch (error: any) {
        // Skip if user already exists
        if (error.code === 11000) {
          console.log(`User ${email} already exists, skipping...`);
          continue;
        }
        throw error;
      }

      // Create shop for retailer
      const shopId = uuidv4();
      const shop = new Shop({
        shopId,
        ownerId: uid,
        shopName: businessName,
        shopType: "retail",
        address: {
          street: `${Math.floor(Math.random() * 999) + 1} Retail Market`,
          city: location.city,
          state: location.state,
          pincode: `${450000 + 10 + i}`,
          country: "India",
        },
        contact: {
          phone: `+91 ${8000000000 + i}`,
          email,
        },
        categories: [CATEGORIES[i % CATEGORIES.length]],
        specialties: ["Retail Quality", "Customer Service"],
        rating: 4.2 + Math.random() * 0.8,
        totalRatings: Math.floor(Math.random() * 30) + 5,
        verified: true,
        isActive: true,
      });

      await shop.save();
      results.shops.push(shopId);

      // Create supplier entries (wholesalers can add retailers as suppliers)
      if (i < 5 && results.wholesalers.length > 0) {
        const wholesalerId = results.wholesalers[Math.floor(Math.random() * results.wholesalers.length)];
        const supplier = new Supplier({
          userId: wholesalerId,
          businessName: businessName,
          contactPerson: businessName.split(' ')[0] + " " + businessName.split(' ')[1],
          email,
          phone: `+91 ${8000000000 + i}`,
          address: `${Math.floor(Math.random() * 999) + 1} Market Street`,
          city: location.city,
          state: location.state,
          pincode: `${450000 + 10 + i}`,
          categories: [CATEGORIES[i % CATEGORIES.length]],
          specialties: ["Retail Supply"],
          rating: 4.0 + Math.random() * 1.0,
          totalTransactions: Math.floor(Math.random() * 20) + 5,
          verified: true,
        });

        await supplier.save();
        results.suppliers.push(supplier._id.toString());
      }
    }

    return NextResponse.json({
      success: true,
      message: "Mock users and data created successfully!",
      counts: {
        wholesalers: results.wholesalers.length,
        retailers: results.retailers.length,
        shops: results.shops.length,
        catalogItems: results.catalogItems.length,
        deadStockListings: results.deadStockListings.length,
        suppliers: results.suppliers.length,
      },
      users: {
        wholesalers: results.wholesalers,
        retailers: results.retailers,
      },
    });
  } catch (error: any) {
    console.error("Error seeding mock users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed mock users" },
      { status: 500 }
    );
  }
}


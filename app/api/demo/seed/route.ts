import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  setDoc,
} from "firebase/firestore";

const DEMO_USER_ID = "demo_user_12345";

export async function POST(request: Request) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Seed Dead Stock Listings
    const deadStockListings = [
      {
        sellerId: DEMO_USER_ID,
        sellerName: "Demo Wholesaler",
        productName: "Cotton Fabric - White",
        category: "Cotton",
        description: "Premium quality white cotton fabric, 100% cotton, suitable for shirts and dresses",
        quantity: 500,
        minQty: 50,
        originalPrice: 120,
        discountPrice: 85,
        discountPercent: 29,
        condition: "new",
        images: [],
        status: "available",
        location: { city: "Mumbai", state: "Maharashtra" },
        views: 45,
        inquiries: 8,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        sellerId: DEMO_USER_ID,
        sellerName: "Demo Wholesaler",
        productName: "Silk Saree Material",
        category: "Silk",
        description: "Beautiful silk fabric for sarees, premium quality",
        quantity: 200,
        minQty: 20,
        originalPrice: 450,
        discountPrice: 320,
        discountPercent: 29,
        condition: "like_new",
        images: [],
        status: "available",
        location: { city: "Surat", state: "Gujarat" },
        views: 78,
        inquiries: 12,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        sellerId: DEMO_USER_ID,
        sellerName: "Demo Wholesaler",
        productName: "Denim Fabric - Blue",
        category: "Denim",
        description: "Heavy duty denim fabric, perfect for jeans manufacturing",
        quantity: 300,
        minQty: 30,
        originalPrice: 180,
        discountPrice: 130,
        discountPercent: 28,
        condition: "new",
        images: [],
        status: "available",
        location: { city: "Ahmedabad", state: "Gujarat" },
        views: 32,
        inquiries: 5,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    // Seed Catalog Items
    const catalogItems = [
      {
        supplierId: DEMO_USER_ID,
        supplierName: "Demo Wholesaler",
        productName: "Premium Cotton Shirt Fabric",
        category: "Cotton",
        description: "High quality cotton fabric for shirts, soft and durable",
        price: 150,
        minOrderQuantity: 100,
        stockAvailable: 5000,
        unit: "meters",
        images: [],
        specifications: { weight: "140 GSM", width: "44 inches" },
        tags: ["cotton", "shirt", "premium"],
        isActive: true,
        views: 120,
        inquiries: 25,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        supplierId: DEMO_USER_ID,
        supplierName: "Demo Wholesaler",
        productName: "Silk Saree Fabric",
        category: "Silk",
        description: "Luxurious silk fabric for traditional sarees",
        price: 500,
        minOrderQuantity: 50,
        stockAvailable: 2000,
        unit: "meters",
        images: [],
        specifications: { weight: "90 GSM", width: "45 inches" },
        tags: ["silk", "saree", "traditional"],
        isActive: true,
        views: 200,
        inquiries: 45,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        supplierId: DEMO_USER_ID,
        supplierName: "Demo Wholesaler",
        productName: "Polyester Blend Fabric",
        category: "Polyester",
        description: "Durable polyester blend fabric for various applications",
        price: 80,
        minOrderQuantity: 200,
        stockAvailable: 10000,
        unit: "meters",
        images: [],
        specifications: { weight: "120 GSM", width: "60 inches" },
        tags: ["polyester", "blend", "durable"],
        isActive: true,
        views: 95,
        inquiries: 18,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    // Seed Ledger Transactions
    const ledgerTransactions = [
      {
        creditorId: DEMO_USER_ID,
        creditorName: "Demo Wholesaler",
        debtorId: "debtor_1",
        debtorName: "Retailer ABC",
        amount: 50000,
        type: "credit",
        description: "Credit sale of cotton fabric",
        dueDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        status: "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        creditorId: DEMO_USER_ID,
        creditorName: "Demo Wholesaler",
        debtorId: "debtor_2",
        debtorName: "Retailer XYZ",
        amount: 35000,
        type: "credit",
        description: "Credit sale of silk fabric",
        dueDate: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
        paidDate: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        status: "paid",
        createdAt: Timestamp.fromDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
        updatedAt: Timestamp.now(),
      },
      {
        creditorId: DEMO_USER_ID,
        creditorName: "Demo Wholesaler",
        debtorId: "debtor_3",
        debtorName: "Retailer PQR",
        amount: 25000,
        type: "credit",
        description: "Credit sale of denim fabric",
        dueDate: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
        status: "overdue",
        createdAt: Timestamp.fromDate(new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)),
        updatedAt: Timestamp.now(),
      },
    ];

    // Seed Shops
    const shops = [
      {
        ownerId: DEMO_USER_ID,
        shopName: "Premium Textiles Wholesale",
        shopType: "wholesale",
        address: {
          street: "123 Textile Market",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "India",
        },
        contact: {
          phone: "+91 9876543210",
          email: "premium@textiles.com",
        },
        categories: ["Cotton", "Silk", "Denim"],
        specialties: ["Premium Quality", "Bulk Orders", "Fast Delivery"],
        rating: 4.5,
        totalRatings: 45,
        verified: true,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        ownerId: "shop_owner_2",
        shopName: "Silk Paradise Wholesale",
        shopType: "wholesale",
        address: {
          street: "456 Fabric Street",
          city: "Surat",
          state: "Gujarat",
          pincode: "395001",
          country: "India",
        },
        contact: {
          phone: "+91 9876543211",
          email: "silk@paradise.com",
        },
        categories: ["Silk", "Saree"],
        specialties: ["Traditional", "Premium Silk"],
        rating: 4.8,
        totalRatings: 32,
        verified: true,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        ownerId: "shop_owner_3",
        shopName: "Denim Experts",
        shopType: "wholesale",
        address: {
          street: "789 Denim Lane",
          city: "Ahmedabad",
          state: "Gujarat",
          pincode: "380001",
          country: "India",
        },
        contact: {
          phone: "+91 9876543212",
          email: "denim@experts.com",
        },
        categories: ["Denim", "Jeans"],
        specialties: ["Heavy Duty", "Export Quality"],
        rating: 4.3,
        totalRatings: 28,
        verified: true,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    // Add all seed data
    const results: {
      deadStock: string[];
      catalog: string[];
      ledger: string[];
      shops: string[];
    } = {
      deadStock: [],
      catalog: [],
      ledger: [],
      shops: [],
    };

    // Add dead stock listings
    for (const listing of deadStockListings) {
      const docRef = await addDoc(collection(db, "deadStockListings"), listing);
      results.deadStock.push(docRef.id);
    }

    // Add catalog items
    for (const item of catalogItems) {
      const docRef = await addDoc(collection(db, "catalogItems"), item);
      results.catalog.push(docRef.id);
    }

    // Add ledger transactions
    for (const transaction of ledgerTransactions) {
      const docRef = await addDoc(collection(db, "ledgerTransactions"), transaction);
      results.ledger.push(docRef.id);
    }

    // Add shops
    for (const shop of shops) {
      const shopId = `shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db!, "shops", shopId), {
        ...shop,
        shopId,
      });
      results.shops.push(shopId);
    }

    return NextResponse.json({
      success: true,
      message: "Demo data seeded successfully!",
      counts: {
        deadStock: results.deadStock.length,
        catalog: results.catalog.length,
        ledger: results.ledger.length,
        shops: results.shops.length,
      },
    });
  } catch (error: any) {
    console.error("Error seeding demo data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed demo data" },
      { status: 500 }
    );
  }
}


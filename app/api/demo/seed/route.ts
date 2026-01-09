import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connect";
import DeadStockListing from "@/lib/mongodb/models/DeadStockListing";
import CatalogItem from "@/lib/mongodb/models/CatalogItem";
import LedgerTransaction from "@/lib/mongodb/models/LedgerTransaction";
import Shop from "@/lib/mongodb/models/Shop";
import { v4 as uuidv4 } from 'uuid';

const DEMO_USER_ID = "demo_user_12345";

export async function POST(request: Request) {
  try {
    await connectDB();

    // Seed Dead Stock Listings
    const deadStockListings = [
      {
        listingId: uuidv4(),
        sellerId: DEMO_USER_ID,
        sellerName: "Demo Wholesaler",
        productName: "Cotton Fabric - White",
        category: "Cotton",
        description: "Premium quality white cotton fabric, 100% cotton, suitable for shirts and dresses",
        quantity: 500,
        originalPrice: 120,
        discountPrice: 85,
        discountPercent: 29,
        condition: "new" as const,
        images: [],
        status: "available" as const,
        location: { city: "Mumbai", state: "Maharashtra" },
        views: 45,
        inquiries: 8,
      },
      {
        listingId: uuidv4(),
        sellerId: DEMO_USER_ID,
        sellerName: "Demo Wholesaler",
        productName: "Silk Saree Material",
        category: "Silk",
        description: "Beautiful silk fabric for sarees, premium quality",
        quantity: 200,
        originalPrice: 450,
        discountPrice: 320,
        discountPercent: 29,
        condition: "like_new" as const,
        images: [],
        status: "available" as const,
        location: { city: "Surat", state: "Gujarat" },
        views: 78,
        inquiries: 12,
      },
      {
        listingId: uuidv4(),
        sellerId: DEMO_USER_ID,
        sellerName: "Demo Wholesaler",
        productName: "Denim Fabric - Blue",
        category: "Denim",
        description: "Heavy duty denim fabric, perfect for jeans manufacturing",
        quantity: 300,
        originalPrice: 180,
        discountPrice: 130,
        discountPercent: 28,
        condition: "new" as const,
        images: [],
        status: "available" as const,
        location: { city: "Ahmedabad", state: "Gujarat" },
        views: 32,
        inquiries: 5,
      },
    ];

    // Seed Catalog Items
    const catalogItems = [
      {
        catalogId: uuidv4(),
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
      },
      {
        catalogId: uuidv4(),
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
      },
      {
        catalogId: uuidv4(),
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
      },
    ];

    // Seed Ledger Transactions
    const ledgerTransactions = [
      {
        transactionId: uuidv4(),
        creditorId: DEMO_USER_ID,
        creditorName: "Demo Wholesaler",
        debtorId: "debtor_1",
        debtorName: "Retailer ABC",
        amount: 50000,
        type: "credit" as const,
        description: "Credit sale of cotton fabric",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "pending" as const,
      },
      {
        transactionId: uuidv4(),
        creditorId: DEMO_USER_ID,
        creditorName: "Demo Wholesaler",
        debtorId: "debtor_2",
        debtorName: "Retailer XYZ",
        amount: 35000,
        type: "credit" as const,
        description: "Credit sale of silk fabric",
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        paidDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "paid" as const,
      },
      {
        transactionId: uuidv4(),
        creditorId: DEMO_USER_ID,
        creditorName: "Demo Wholesaler",
        debtorId: "debtor_3",
        debtorName: "Retailer PQR",
        amount: 25000,
        type: "credit" as const,
        description: "Credit sale of denim fabric",
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: "overdue" as const,
      },
    ];

    // Seed Shops
    const shops = [
      {
        shopId: uuidv4(),
        ownerId: DEMO_USER_ID,
        shopName: "Premium Textiles Wholesale",
        shopType: "wholesale" as const,
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
      },
      {
        shopId: uuidv4(),
        ownerId: "shop_owner_2",
        shopName: "Silk Paradise Wholesale",
        shopType: "wholesale" as const,
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
      },
      {
        shopId: uuidv4(),
        ownerId: "shop_owner_3",
        shopName: "Denim Experts",
        shopType: "wholesale" as const,
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
      const doc = new DeadStockListing(listing);
      await doc.save();
      results.deadStock.push(doc.listingId);
    }

    // Add catalog items
    for (const item of catalogItems) {
      const doc = new CatalogItem(item);
      await doc.save();
      results.catalog.push(doc.catalogId);
    }

    // Add ledger transactions
    for (const transaction of ledgerTransactions) {
      const doc = new LedgerTransaction(transaction);
      await doc.save();
      results.ledger.push(doc.transactionId);
    }

    // Add shops
    for (const shop of shops) {
      const doc = new Shop(shop);
      await doc.save();
      results.shops.push(doc.shopId);
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

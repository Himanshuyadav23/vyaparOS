export interface User {
  uid: string;
  email: string;
  displayName?: string;
  businessName: string;
  businessType: "wholesaler" | "retailer" | "manufacturer";
  role?: "wholesaler" | "retailer" | "manufacturer" | "admin";
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  shopId?: string;
  verified: boolean;
  isPremium?: boolean;
  premiumExpiresAt?: Date;
  featuredListingsCount?: number;
  featuredSellerCount?: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Shop {
  shopId: string;
  ownerId: string;
  shopName: string;
  shopType: "wholesale" | "retail" | "both";
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email?: string;
    alternatePhone?: string;
  };
  businessHours?: {
    [day: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  categories: string[];
  specialties: string[];
  rating: number;
  totalRatings: number;
  verified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeadStock {
  id: string;
  listingId?: string;
  sellerId: string;
  sellerName: string;
  shopId?: string;
  productId?: string;
  productName: string;
  category: string;
  description: string;
  quantity: number;
  minQty?: number;
  originalPrice: number;
  discountPrice: number;
  discountPercent?: number;
  condition: "new" | "like_new" | "good" | "fair";
  images: string[];
  location?: {
    city: string;
    state: string;
  };
  status: "available" | "reserved" | "sold" | "expired";
  isFeatured?: boolean;
  views?: number;
  inquiries?: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  soldAt?: Date;
}

export interface CatalogItem {
  id: string;
  catalogId?: string;
  supplierId: string;
  supplierName: string;
  shopId?: string;
  productId?: string;
  productName: string;
  category: string;
  subcategory?: string;
  description: string;
  price: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  stockAvailable?: number;
  unit?: string;
  images: string[];
  specifications: Record<string, string>;
  tags: string[];
  isActive: boolean;
  isFeatured?: boolean;
  views?: number;
  inquiries?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditTransaction {
  id: string;
  transactionId?: string;
  creditorId: string;
  creditorName: string;
  creditorShopId?: string;
  debtorId: string;
  debtorName: string;
  debtorShopId?: string;
  amount: number;
  type: "credit" | "debit" | "payment" | "adjustment";
  description: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  dueDate?: Date;
  paidDate?: Date;
  paymentMethod?: "cash" | "bank_transfer" | "upi" | "cheque";
  status: "pending" | "paid" | "overdue" | "cancelled";
  relatedTransactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  userId: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  categories: string[];
  specialties: string[];
  rating: number;
  adminRating?: number;
  totalTransactions: number;
  verified: boolean;
  banned?: boolean;
  badSupplier?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketSignal {
  id: string;
  category: string;
  signalType: "price_trend" | "demand_surge" | "supply_shortage" | "new_product";
  value: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  region: string;
}

export interface MarketStats {
  id: string;
  statId: string; // Format: "YYYY-MM-DD-metric"
  date: Date; // Start of day
  metric: "top_dead_stock_categories" | "top_demanded_categories" | "avg_payment_delay";
  category?: string; // For category-specific stats
  region?: string; // City or state
  value: number;
  change?: number; // Change from previous period
  changePercent?: number;
  metadata: {
    topCategories?: Array<{ category: string; count: number; totalValue: number }>;
    avgDelayDays?: number;
    totalTransactions?: number;
    sampleSize?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

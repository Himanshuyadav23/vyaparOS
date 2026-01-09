# Firestore Schema Design for VyaparOS

## Collection Structure

### 1. `users`
User accounts with role-based access.

**Fields:**
```typescript
{
  uid: string (document ID),
  email: string,
  displayName?: string,
  businessName: string,
  businessType: "wholesaler" | "retailer" | "manufacturer",
  role: "wholesaler" | "retailer" | "admin",
  phone?: string,
  address?: {
    street: string,
    city: string,
    state: string,
    pincode: string,
    country: string
  },
  shopId?: string, // Reference to shops collection
  verified: boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt?: timestamp
}
```

**Indexes:**
- `businessType` (ascending)
- `role` (ascending)
- `city` (ascending) - for location-based queries
- `verified` (ascending)

---

### 2. `shops`
Shop/business locations and details.

**Fields:**
```typescript
{
  shopId: string (document ID),
  ownerId: string, // Reference to users.uid
  shopName: string,
  shopType: "wholesale" | "retail" | "both",
  address: {
    street: string,
    city: string,
    state: string,
    pincode: string,
    country: string,
    coordinates?: {
      lat: number,
      lng: number
    }
  },
  contact: {
    phone: string,
    email?: string,
    alternatePhone?: string
  },
  businessHours?: {
    [day: string]: {
      open: string, // "09:00"
      close: string, // "18:00"
      closed: boolean
    }
  },
  categories: string[], // Product categories this shop deals in
  specialties: string[], // Special product lines
  rating: number, // Average rating (0-5)
  totalRatings: number,
  verified: boolean,
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `ownerId` (ascending)
- `city` (ascending)
- `state` (ascending)
- `shopType` (ascending)
- `verified` (ascending)
- `isActive` (ascending)
- `rating` (descending)
- Composite: `city` + `shopType` + `isActive`
- Composite: `state` + `categories` (array-contains)

---

### 3. `products`
Master product catalog.

**Fields:**
```typescript
{
  productId: string (document ID),
  name: string,
  category: string,
  subcategory?: string,
  brand?: string,
  description: string,
  specifications: {
    [key: string]: string | number
  },
  tags: string[],
  images: string[], // Firebase Storage URLs
  basePrice: number, // Base price in INR
  unit: string, // "piece", "meter", "kg", etc.
  minOrderQuantity: number,
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `category` (ascending)
- `subcategory` (ascending)
- `isActive` (ascending)
- `basePrice` (ascending)
- Composite: `category` + `isActive`
- Composite: `tags` (array-contains) + `isActive`

---

### 4. `deadStockListings`
Dead stock/excess inventory listings.

**Fields:**
```typescript
{
  listingId: string (document ID),
  sellerId: string, // Reference to users.uid
  sellerName: string,
  shopId?: string, // Reference to shops.shopId
  productId?: string, // Reference to products.productId
  productName: string,
  category: string,
  description: string,
  quantity: number,
  originalPrice: number,
  discountPrice: number,
  discountPercent: number, // Calculated: ((originalPrice - discountPrice) / originalPrice) * 100
  condition: "new" | "like_new" | "good" | "fair",
  images: string[],
  location: {
    city: string,
    state: string
  },
  status: "available" | "reserved" | "sold" | "expired",
  views: number,
  inquiries: number,
  expiresAt?: timestamp, // Optional expiration date
  createdAt: timestamp,
  updatedAt: timestamp,
  soldAt?: timestamp
}
```

**Indexes:**
- `sellerId` (ascending)
- `status` (ascending)
- `category` (ascending)
- `city` (ascending)
- `state` (ascending)
- `discountPercent` (descending)
- `createdAt` (descending)
- Composite: `status` + `category` + `createdAt`
- Composite: `status` + `city` + `createdAt`
- Composite: `status` + `discountPercent` (descending)

---

### 5. `catalogItems`
Supplier product catalogs.

**Fields:**
```typescript
{
  catalogId: string (document ID),
  supplierId: string, // Reference to users.uid
  supplierName: string,
  shopId?: string, // Reference to shops.shopId
  productId?: string, // Reference to products.productId
  productName: string,
  category: string,
  subcategory?: string,
  description: string,
  price: number,
  minOrderQuantity: number,
  maxOrderQuantity?: number,
  stockAvailable: number,
  unit: string,
  images: string[],
  specifications: {
    [key: string]: string | number
  },
  tags: string[],
  isActive: boolean,
  isFeatured: boolean,
  views: number,
  inquiries: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `supplierId` (ascending)
- `category` (ascending)
- `isActive` (ascending)
- `isFeatured` (ascending)
- `price` (ascending)
- `createdAt` (descending)
- Composite: `supplierId` + `isActive`
- Composite: `category` + `isActive` + `price`
- Composite: `isFeatured` + `isActive` + `createdAt`

---

### 6. `ledgerTransactions`
Credit/debit transactions between businesses.

**Fields:**
```typescript
{
  transactionId: string (document ID),
  creditorId: string, // Reference to users.uid (who gave credit)
  creditorName: string,
  creditorShopId?: string,
  debtorId: string, // Reference to users.uid (who owes)
  debtorName: string,
  debtorShopId?: string,
  amount: number,
  type: "credit" | "debit" | "payment" | "adjustment",
  description: string,
  invoiceNumber?: string,
  invoiceUrl?: string, // Firebase Storage URL
  dueDate?: timestamp,
  paidDate?: timestamp,
  paymentMethod?: "cash" | "bank_transfer" | "upi" | "cheque",
  status: "pending" | "paid" | "overdue" | "cancelled",
  relatedTransactionId?: string, // For linked transactions
  notes?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `creditorId` (ascending)
- `debtorId` (ascending)
- `status` (ascending)
- `type` (ascending)
- `dueDate` (ascending)
- `createdAt` (descending)
- Composite: `creditorId` + `status` + `createdAt`
- Composite: `debtorId` + `status` + `createdAt`
- Composite: `status` + `dueDate` (for overdue queries)

---

### 7. `inquiries`
Buyer inquiries for products/listings.

**Fields:**
```typescript
{
  inquiryId: string (document ID),
  buyerId: string, // Reference to users.uid
  buyerName: string,
  sellerId: string, // Reference to users.uid
  sellerName: string,
  type: "deadStock" | "catalog" | "general",
  relatedId: string, // deadStockListings.listingId or catalogItems.catalogId
  relatedType: "deadStockListing" | "catalogItem",
  message: string,
  quantity?: number,
  proposedPrice?: number,
  status: "pending" | "responded" | "accepted" | "rejected" | "closed",
  response?: string,
  respondedAt?: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `buyerId` (ascending)
- `sellerId` (ascending)
- `status` (ascending)
- `type` (ascending)
- `createdAt` (descending)
- Composite: `sellerId` + `status` + `createdAt`
- Composite: `buyerId` + `status` + `createdAt`

---

### 8. `marketStats`
Aggregated daily market statistics (read-only, system-generated).

**Fields:**
```typescript
{
  statId: string (document ID), // Format: "YYYY-MM-DD-category-signalType"
  date: timestamp, // Start of day
  category: string,
  signalType: "price_trend" | "demand_surge" | "supply_shortage" | "new_product",
  region: string, // "city" or "state"
  value: number,
  change: number, // Change from previous period
  changePercent: number,
  sampleSize: number, // Number of data points used
  metadata: {
    minPrice?: number,
    maxPrice?: number,
    avgPrice?: number,
    totalListings?: number,
    totalInquiries?: number
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `date` (descending)
- `category` (ascending)
- `signalType` (ascending)
- `region` (ascending)
- Composite: `date` + `category` + `signalType`
- Composite: `date` + `region` + `signalType`

---

## Relationships

```
users (1) ──< (many) shops
users (1) ──< (many) deadStockListings
users (1) ──< (many) catalogItems
users (1) ──< (many) ledgerTransactions (as creditor)
users (1) ──< (many) ledgerTransactions (as debtor)
users (1) ──< (many) inquiries (as buyer)
users (1) ──< (many) inquiries (as seller)

shops (1) ──< (many) deadStockListings
shops (1) ──< (many) catalogItems

products (1) ──< (many) deadStockListings (optional)
products (1) ──< (many) catalogItems (optional)

deadStockListings (1) ──< (many) inquiries
catalogItems (1) ──< (many) inquiries
```

---

## Data Access Patterns

### Common Queries

1. **Get user's shops:**
   - Collection: `shops`
   - Filter: `ownerId == userId`
   - Order: `createdAt desc`

2. **Browse dead stock by category:**
   - Collection: `deadStockListings`
   - Filter: `status == "available" && category == X`
   - Order: `createdAt desc`

3. **Get pending credits:**
   - Collection: `ledgerTransactions`
   - Filter: `creditorId == userId && status == "pending"`
   - Order: `dueDate asc`

4. **Get market trends:**
   - Collection: `marketStats`
   - Filter: `date >= last7Days && category == X`
   - Order: `date desc`

---

## Security Considerations

- Users can only read/write their own data
- Dead stock listings are readable by all authenticated users
- Catalog items are readable by all authenticated users
- Ledger transactions are readable by creditor and debtor only
- Inquiries are readable by buyer and seller only
- Market stats are readable by all authenticated users (read-only)
- Admin users have elevated permissions




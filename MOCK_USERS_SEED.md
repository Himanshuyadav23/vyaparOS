# 🎭 Mock Users Seed - Central India

## Overview

This seed script creates realistic mock data to make the platform look like it has an active userbase from Central India.

## What Gets Created

### 10 Wholesalers
- **Business Names**: Central Indian themed (e.g., "Shri Ganesh Textiles", "Madhya Pradesh Wholesale Mart")
- **Locations**: Indore, Bhopal, Jabalpur, Gwalior, Raipur, Bhilai, Nagpur, Aurangabad
- **Each wholesaler gets:**
  - User account (verified)
  - Shop listing
  - 3-5 catalog items
  - 1-2 dead stock listings

### 7 Retailers
- **Business Names**: Traditional Indian names (e.g., "Shree Ram Textiles", "Krishna Cloth House")
- **Locations**: Central Indian cities
- **Each retailer gets:**
  - User account (verified)
  - Shop listing
  - Some retailers added as suppliers to wholesalers

## Total Data Created

- **10 Wholesalers** with accounts
- **7 Retailers** with accounts
- **17 Shops** (one per user)
- **30-50 Catalog Items** (3-5 per wholesaler)
- **10-20 Dead Stock Listings** (1-2 per wholesaler)
- **5 Supplier Entries** (retailers added as suppliers)

## How to Use

### Option 1: Via Demo Page

1. Go to `/demo` page
2. Click **"Create 10 Wholesalers & 7 Retailers (Central India)"** button
3. Wait for success message
4. Data will be created in your MongoDB database

### Option 2: Via API

```bash
POST /api/seed/mock-users
```

## User Credentials

All mock users have the same password:
- **Password**: `password123`

**Wholesaler Emails:**
- `wholesaler1@vyaparos.com`
- `wholesaler2@vyaparos.com`
- ... up to `wholesaler10@vyaparos.com`

**Retailer Emails:**
- `retailer1@vyaparos.com`
- `retailer2@vyaparos.com`
- ... up to `retailer7@vyaparos.com`

## Business Names

### Wholesalers
1. Shri Ganesh Textiles
2. Madhya Pradesh Wholesale Mart
3. Central India Fabrics
4. Indore Textile Traders
5. Bhopal Wholesale Hub
6. Jabalpur Textile Suppliers
7. Gwalior Fabric House
8. Raipur Wholesale Center
9. Bhilai Textile Emporium
10. Nagpur Wholesale Traders

### Retailers
1. Shree Ram Textiles
2. Krishna Cloth House
3. Lakshmi Fabric Store
4. Sai Textile Mart
5. Om Textiles
6. Radha Cloth Center
7. Ganesh Fabric Shop

## Locations

All businesses are from Central India:
- **Madhya Pradesh**: Indore, Bhopal, Jabalpur, Gwalior
- **Chhattisgarh**: Raipur, Bhilai
- **Maharashtra**: Nagpur, Aurangabad

## Features

- ✅ Realistic Central Indian business names
- ✅ Proper addresses with pincodes
- ✅ Phone numbers
- ✅ Verified accounts
- ✅ Shops with ratings
- ✅ Catalog items with specifications
- ✅ Dead stock listings with discounts
- ✅ Supplier relationships

## Notes

- The script is idempotent - running it multiple times will create duplicate users (they'll have different UUIDs)
- All users are verified
- All shops are active
- Catalog items have realistic prices and quantities
- Dead stock listings have 30% discount on average

## After Seeding

Once you've seeded the data:
1. Browse `/dashboard/suppliers` to see all the suppliers
2. Browse `/dashboard/catalog` to see catalog items
3. Browse `/dashboard/dead-stock` to see listings
4. The platform will look active and populated!

Enjoy your active userbase! 🎉









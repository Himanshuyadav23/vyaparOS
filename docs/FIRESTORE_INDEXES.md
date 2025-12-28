# Firestore Indexes Required for VyaparOS

This document lists all composite indexes needed for efficient queries.

## How to Create Indexes

1. **Automatic**: Firestore will prompt you to create indexes when you run queries that need them
2. **Manual**: Go to Firebase Console > Firestore Database > Indexes tab
3. **firestore.indexes.json**: Deploy via Firebase CLI

## Required Indexes

### Collection: `users`

1. **businessType** (Ascending)
2. **role** (Ascending)
3. **city** (Ascending)
4. **verified** (Ascending)

### Collection: `shops`

1. **ownerId** (Ascending)
2. **city** (Ascending)
3. **state** (Ascending)
4. **shopType** (Ascending)
5. **verified** (Ascending)
6. **isActive** (Ascending)
7. **rating** (Descending)
8. **Composite**: `city` + `shopType` + `isActive`
9. **Composite**: `state` + `categories` (Array-contains) + `isActive`

### Collection: `products`

1. **category** (Ascending)
2. **subcategory** (Ascending)
3. **isActive** (Ascending)
4. **basePrice** (Ascending)
5. **Composite**: `category` + `isActive`
6. **Composite**: `tags` (Array-contains) + `isActive`

### Collection: `deadStockListings`

1. **sellerId** (Ascending)
2. **status** (Ascending)
3. **category** (Ascending)
4. **city** (Ascending)
5. **state** (Ascending)
6. **discountPercent** (Descending)
7. **createdAt** (Descending)
8. **Composite**: `status` + `category` + `createdAt` (Descending)
9. **Composite**: `status` + `city` + `createdAt` (Descending)
10. **Composite**: `status` + `discountPercent` (Descending) + `createdAt` (Descending)

### Collection: `catalogItems`

1. **supplierId** (Ascending)
2. **category** (Ascending)
3. **isActive** (Ascending)
4. **isFeatured** (Ascending)
5. **price** (Ascending)
6. **createdAt** (Descending)
7. **Composite**: `supplierId` + `isActive`
8. **Composite**: `category` + `isActive` + `price` (Ascending)
9. **Composite**: `isFeatured` + `isActive` + `createdAt` (Descending)

### Collection: `ledgerTransactions`

1. **creditorId** (Ascending)
2. **debtorId** (Ascending)
3. **status** (Ascending)
4. **type** (Ascending)
5. **dueDate** (Ascending)
6. **createdAt** (Descending)
7. **Composite**: `creditorId` + `status` + `createdAt` (Descending)
8. **Composite**: `debtorId` + `status` + `createdAt` (Descending)
9. **Composite**: `status` + `dueDate` (Ascending)

### Collection: `inquiries`

1. **buyerId** (Ascending)
2. **sellerId** (Ascending)
3. **status** (Ascending)
4. **type** (Ascending)
5. **createdAt** (Descending)
6. **Composite**: `sellerId` + `status` + `createdAt` (Descending)
7. **Composite**: `buyerId` + `status` + `createdAt` (Descending)

### Collection: `marketStats`

1. **date** (Descending)
2. **category** (Ascending)
3. **signalType** (Ascending)
4. **region** (Ascending)
5. **Composite**: `date` (Descending) + `category` + `signalType`
6. **Composite**: `date` (Descending) + `region` + `signalType`

## firestore.indexes.json

```json
{
  "indexes": [
    {
      "collectionGroup": "shops",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "city", "order": "ASCENDING" },
        { "fieldPath": "shopType", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "shops",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "state", "order": "ASCENDING" },
        { "fieldPath": "categories", "arrayConfig": "CONTAINS" },
        { "fieldPath": "isActive", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tags", "arrayConfig": "CONTAINS" },
        { "fieldPath": "isActive", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "deadStockListings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "deadStockListings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "city", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "deadStockListings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "discountPercent", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "catalogItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "supplierId", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "catalogItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "catalogItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isFeatured", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "ledgerTransactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "creditorId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "ledgerTransactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "debtorId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "ledgerTransactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "dueDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "inquiries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sellerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "inquiries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "buyerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "marketStats",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "DESCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "signalType", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "marketStats",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "DESCENDING" },
        { "fieldPath": "region", "order": "ASCENDING" },
        { "fieldPath": "signalType", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Deployment

Save the above JSON as `firestore.indexes.json` in your project root and deploy:

```bash
firebase deploy --only firestore:indexes
```

Or create indexes manually through Firebase Console when prompted.




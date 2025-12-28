# VyaparOS Firestore Schema Summary

## Quick Reference

### Collections

| Collection | Purpose | Read Access | Write Access |
|------------|---------|-------------|--------------|
| `users` | User accounts | All authenticated | Own profile only |
| `shops` | Business locations | All authenticated | Own shops only |
| `products` | Master product catalog | All authenticated | Admin only |
| `deadStockListings` | Excess inventory | All authenticated | Own listings only |
| `catalogItems` | Supplier catalogs | All authenticated | Own items only |
| `ledgerTransactions` | Credit/debit records | Creditor/Debtor | Creditor creates, both can update |
| `inquiries` | Buyer inquiries | Buyer/Seller | Buyer creates, both can update |
| `marketStats` | Aggregated stats | All authenticated | System/Admin only |

## Role-Based Access

### Wholesaler
- ✅ Create/update own shops
- ✅ Create/update own dead stock listings
- ✅ Create/update own catalog items
- ✅ Create ledger transactions (as creditor)
- ✅ View all available listings and catalogs
- ✅ Create inquiries on listings/catalogs
- ❌ Cannot modify master products

### Retailer
- ✅ Create/update own shops
- ✅ Create/update own dead stock listings
- ✅ Create/update own catalog items
- ✅ Create ledger transactions (as creditor)
- ✅ View all available listings and catalogs
- ✅ Create inquiries on listings/catalogs
- ❌ Cannot modify master products

### Admin
- ✅ Full access to all collections
- ✅ Can create/update/delete master products
- ✅ Can create/update market stats
- ✅ Can delete any user data

## Key Security Rules

1. **Multi-tenant isolation**: Users can only modify their own data
2. **Read access**: Most collections are readable by all authenticated users
3. **Transaction privacy**: Ledger transactions visible only to creditor and debtor
4. **Inquiry privacy**: Inquiries visible only to buyer and seller
5. **Admin override**: Admins have elevated permissions
6. **Data integrity**: Prevents changing ownership fields (sellerId, creditorId, etc.)

## Data Relationships

```
User (1) ──< (many) Shops
User (1) ──< (many) DeadStockListings
User (1) ──< (many) CatalogItems
User (1) ──< (many) LedgerTransactions (creditor)
User (1) ──< (many) LedgerTransactions (debtor)
User (1) ──< (many) Inquiries (buyer)
User (1) ──< (many) Inquiries (seller)

Shop (1) ──< (many) DeadStockListings
Shop (1) ──< (many) CatalogItems

Product (1) ──< (many) DeadStockListings (optional)
Product (1) ──< (many) CatalogItems (optional)

DeadStockListing (1) ──< (many) Inquiries
CatalogItem (1) ──< (many) Inquiries
```

## Common Query Patterns

### Get user's shops
```typescript
const shops = await getDocs(
  query(collection(db, "shops"), 
    where("ownerId", "==", userId),
    orderBy("createdAt", "desc")
  )
);
```

### Browse dead stock by category
```typescript
const listings = await getDocs(
  query(collection(db, "deadStockListings"),
    where("status", "==", "available"),
    where("category", "==", category),
    orderBy("createdAt", "desc"),
    limit(20)
  )
);
```

### Get pending credits
```typescript
const pending = await getDocs(
  query(collection(db, "ledgerTransactions"),
    where("creditorId", "==", userId),
    where("status", "==", "pending"),
    orderBy("dueDate", "asc")
  )
);
```

### Get market trends
```typescript
const stats = await getDocs(
  query(collection(db, "marketStats"),
    where("date", ">=", last7Days),
    where("category", "==", category),
    orderBy("date", "desc")
  )
);
```

## Deployment Checklist

- [ ] Deploy security rules: `firebase deploy --only firestore:rules`
- [ ] Deploy indexes: `firebase deploy --only firestore:indexes`
- [ ] Verify rules in Firebase Console
- [ ] Test queries that require indexes
- [ ] Create admin user with role="admin"
- [ ] Test role-based access

## Next Steps

1. Update TypeScript types in `types/index.ts` to match new schema
2. Update service functions in `lib/services/` to use new collection names
3. Migrate existing data from old collections to new ones
4. Update UI components to use new field names




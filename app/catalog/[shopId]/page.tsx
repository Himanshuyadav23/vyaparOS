"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCatalogItems, incrementCatalogViews } from "@/lib/services/catalogItems";
import { CatalogItem } from "@/types";
import CatalogCard from "@/components/catalog/CatalogCard";
import { Search, Filter, ShoppingBag, Eye, MessageCircle } from "lucide-react";
// Shop info will be fetched via API if needed
import Loading from "@/components/ui/Loading";

export default function PublicCatalogPage() {
  const params = useParams();
  const shopId = params.shopId as string;
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  useEffect(() => {
    if (shopId) {
      loadCatalog();
      loadShopInfo();
    }
  }, [shopId]);

  useEffect(() => {
    // Increment views for all items when page loads
    items.forEach((item) => {
      if (item.id) {
        incrementCatalogViews(item.id).catch(console.error);
      }
    });
  }, [items]);

  const loadShopInfo = async () => {
    try {
      // Try to get shop info via API
      // For now, use a default name - can be enhanced with shop API later
      setShopName("Product Catalog");
    } catch (error) {
      console.error("Error loading shop info:", error);
      setShopName("Product Catalog");
    }
  };

  const loadCatalog = async () => {
    try {
      const filters: any = {
        shopId: shopId,
        isActive: true,
      };

      const data = await getCatalogItems(filters);
      setItems(data);
    } catch (error) {
      console.error("Error loading catalog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInquire = (item: CatalogItem) => {
    // Generate WhatsApp message
    const message = encodeURIComponent(
      `Hello! I'm interested in your product:\n\n` +
        `Product: ${item.productName}\n` +
        `Category: ${item.category}\n` +
        `Price: ₹${item.price}\n` +
        `Min Order: ${item.minOrderQuantity} ${item.unit || "units"}\n` +
        (item.supplierName ? `Supplier: ${item.supplierName}\n` : ``) +
        `\nPlease let me know more details.`
    );

    // Get supplier phone (fetch from user document)
    // For now, using placeholder - in production, fetch from user document
    const phoneNumber = "919876543210"; // Replace with actual supplier phone

    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${message}`;
    window.open(whatsappUrl, "_blank");

    // Increment inquiry count
    if (item.id) {
      incrementCatalogViews(item.id).catch(console.error);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !categoryFilter || item.category === categoryFilter;

    const matchesPrice =
      (!priceRange.min || item.price >= parseFloat(priceRange.min)) &&
      (!priceRange.max || item.price <= parseFloat(priceRange.max));

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const categories = Array.from(new Set(items.map((item) => item.category))).sort();
  const maxPrice = items.length > 0 ? Math.max(...items.map((item) => item.price)) : 0;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{shopName}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Product Catalog • {items.length} items
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>
                  {items.reduce((sum, item) => sum + (item.views || 0), 0)} views
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, categories, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range (₹)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max={maxPrice}
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Showing {filteredItems.length} of {items.length} products
          </p>
        </div>

        {/* Catalog Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <CatalogCard key={item.id} item={item} onInquire={handleInquire} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
            {(searchTerm || categoryFilter || priceRange.min || priceRange.max) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("");
                  setPriceRange({ min: "", max: "" });
                }}
                className="mt-4 text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


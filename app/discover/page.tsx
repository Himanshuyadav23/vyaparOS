"use client";

import { useEffect, useState } from "react";
import { getShops } from "@/lib/services/shops";
import { Shop } from "@/types";
import ShopCard from "@/components/supplier/ShopCard";
import { Search, MapPin, Filter, X } from "lucide-react";
import Loading from "@/components/ui/Loading";

export default function DiscoverPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState({ city: "", state: "" });
  const [shopTypeFilter, setShopTypeFilter] = useState<Shop["shopType"] | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadShops();
  }, [categoryFilter, locationFilter.city, locationFilter.state, shopTypeFilter]);

  const loadShops = async () => {
    try {
      const filters: any = {
        isActive: true,
        verified: true, // Show only verified shops
      };

      if (locationFilter.city) {
        filters.city = locationFilter.city;
      }
      if (locationFilter.state) {
        filters.state = locationFilter.state;
      }
      if (shopTypeFilter !== "all") {
        filters.shopType = shopTypeFilter;
      }
      if (categoryFilter) {
        filters.category = categoryFilter;
      }

      const data = await getShops(filters);
      setShops(data);
    } catch (error) {
      console.error("Error loading shops:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (shop: Shop) => {
    // Generate WhatsApp message
    const message = encodeURIComponent(
      `Hello ${shop.shopName},\n\n` +
        `I'm interested in your products and would like to know more.\n\n` +
        `Please share your catalog and pricing details.`
    );

    const phoneNumber = shop.contact.phone?.replace(/\D/g, "") || "";
    if (phoneNumber) {
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(whatsappUrl, "_blank");
    } else if (shop.contact.email) {
      window.location.href = `mailto:${shop.contact.email}`;
    }
  };

  // Filter shops
  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.categories.some((cat) =>
        cat.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      shop.specialties.some((spec) =>
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesSearch;
  });

  // Get unique values for filters
  const cities = Array.from(new Set(shops.map((s) => s.address.city))).sort();
  const states = Array.from(new Set(shops.map((s) => s.address.state))).sort();
  const categories = Array.from(
    new Set(shops.flatMap((s) => s.categories))
  ).sort();

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Discover Suppliers</h1>
            <p className="mt-3 text-base text-gray-600">
              Find verified wholesalers and suppliers for your business
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by shop name, location, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filters
              {(categoryFilter || locationFilter.city || locationFilter.state || shopTypeFilter !== "all") && (
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                  Active
                </span>
              )}
            </button>
            <p className="text-sm text-gray-500">
              {filteredShops.length} {filteredShops.length === 1 ? "shop" : "shops"} found
            </p>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
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

              {/* State Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  value={locationFilter.state}
                  onChange={(e) =>
                    setLocationFilter({ ...locationFilter, state: e.target.value, city: "" })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All States</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <select
                  value={locationFilter.city}
                  onChange={(e) =>
                    setLocationFilter({ ...locationFilter, city: e.target.value })
                  }
                  disabled={!locationFilter.state}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                >
                  <option value="">All Cities</option>
                  {cities
                    .filter((city) =>
                      locationFilter.state
                        ? shops.some(
                            (s) =>
                              s.address.city === city &&
                              s.address.state === locationFilter.state
                          )
                        : true
                    )
                    .map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>

              {/* Shop Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop Type
                </label>
                <select
                  value={shopTypeFilter}
                  onChange={(e) =>
                    setShopTypeFilter(
                      e.target.value as Shop["shopType"] | "all"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="retail">Retail</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(categoryFilter || locationFilter.city || locationFilter.state || shopTypeFilter !== "all") && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {categoryFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                    Category: {categoryFilter}
                    <button
                      onClick={() => setCategoryFilter("")}
                      className="hover:text-primary-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {locationFilter.state && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                    State: {locationFilter.state}
                    <button
                      onClick={() =>
                        setLocationFilter({ city: "", state: "" })
                      }
                      className="hover:text-primary-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {locationFilter.city && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                    City: {locationFilter.city}
                    <button
                      onClick={() =>
                        setLocationFilter({ ...locationFilter, city: "" })
                      }
                      className="hover:text-primary-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {shopTypeFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                    Type: {shopTypeFilter}
                    <button
                      onClick={() => setShopTypeFilter("all")}
                      className="hover:text-primary-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Shops Grid */}
        {filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <ShopCard key={shop.shopId} shop={shop} onContact={handleContact} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No shops found</p>
            {(searchTerm || categoryFilter || locationFilter.city || locationFilter.state) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("");
                  setLocationFilter({ city: "", state: "" });
                  setShopTypeFilter("all");
                }}
                className="text-primary-600 hover:text-primary-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


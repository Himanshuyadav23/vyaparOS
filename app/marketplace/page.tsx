"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getDeadStockListings } from "@/lib/services/deadStockListings";
import { getCatalogItems } from "@/lib/services/catalogItems";
import { DeadStock, CatalogItem } from "@/types";
import DeadStockCard from "@/components/deadStock/DeadStockCard";
import CatalogCard from "@/components/catalog/CatalogCard";
import { Search, Filter, Package, ShoppingBag, MessageCircle, TrendingUp, MapPin, Users } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import ContactModal from "@/components/ui/ContactModal";

type TabType = "all" | "deadstock" | "catalog";

export default function MarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [deadStockListings, setDeadStockListings] = useState<DeadStock[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState({ city: "", state: "" });
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  useEffect(() => {
    loadMarketplaceData();
  }, [categoryFilter, locationFilter.city, locationFilter.state]);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      const [deadStockData, catalogData] = await Promise.all([
        getDeadStockListings(
          {
            category: categoryFilter || undefined,
            status: "available",
            city: locationFilter.city || undefined,
            state: locationFilter.state || undefined,
          },
          200 // Increased limit to show all listings including mock data
        ),
        getCatalogItems(
          {
            category: categoryFilter || undefined,
            isActive: true,
          },
          200 // Increased limit to show all items including mock data
        ),
      ]);

      setDeadStockListings(deadStockData);
      setCatalogItems(catalogData);
    } catch (error) {
      console.error("Error loading marketplace data:", error);
      showError("Failed to load marketplace data");
    } finally {
      setLoading(false);
    }
  };

  const [contactModal, setContactModal] = useState<{
    isOpen: boolean;
    sellerName: string;
    sellerEmail?: string;
    sellerPhone?: string;
    productName: string;
    sellerId?: string;
    type?: "deadstock" | "catalog";
  } | null>(null);

  const handleInquire = async (item: DeadStock | CatalogItem, type: "deadstock" | "catalog") => {
    if (!user) {
      showError("Please login to send inquiries");
      router.push("/auth/login?redirect=/marketplace");
      return;
    }

    try {
      const sellerName = type === "deadstock" ? (item as DeadStock).sellerName : (item as CatalogItem).supplierName;
      const sellerId = type === "deadstock" ? (item as DeadStock).sellerId : (item as CatalogItem).supplierId;
      const productName = type === "deadstock" ? (item as DeadStock).productName : (item as CatalogItem).productName;

      // Get seller contact information
      let phoneNumber: string | null = null;
      let sellerEmail: string | null = null;
      
      try {
        const userResponse = await fetch(`/api/user/${sellerId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          phoneNumber = userData.phone || null;
          sellerEmail = userData.email || null;
        }
      } catch (error) {
        console.error("Error fetching seller info:", error);
      }

      // Try to get phone from shop if user doesn't have one
      if (!phoneNumber) {
        try {
          const shopsResponse = await fetch(`/api/shops?ownerId=${sellerId}`);
          if (shopsResponse.ok) {
            const shops = await shopsResponse.json();
            if (shops.length > 0 && shops[0].contact?.phone) {
              phoneNumber = shops[0].contact.phone;
              if (!sellerEmail && shops[0].contact?.email) {
                sellerEmail = shops[0].contact.email;
              }
            }
          }
        } catch (error) {
          console.error("Error fetching shop info:", error);
        }
      }

      // If no phone number, show contact modal with available options
      if (!phoneNumber) {
        setContactModal({
          isOpen: true,
          sellerName,
          sellerEmail: sellerEmail || undefined,
          sellerPhone: undefined,
          productName,
          sellerId,
          type,
        });
        return;
      }

      // Send WhatsApp inquiry via API
      const { sendWhatsAppInquiry } = await import("@/lib/utils/whatsapp");
      
      if (type === "deadstock") {
        const deadStockItem = item as DeadStock;
        await sendWhatsAppInquiry({
          productName,
          category: deadStockItem.category,
          price: deadStockItem.discountPrice,
          quantity: deadStockItem.quantity,
          sellerName,
          type: "deadstock",
          phoneNumber,
          buyerName: user.businessName || user.displayName || user.email,
          buyerEmail: user.email,
          buyerPhone: user.phone,
        });
      } else {
        const catalogItem = item as CatalogItem;
        await sendWhatsAppInquiry({
          productName,
          category: catalogItem.category,
          price: catalogItem.price,
          minOrderQuantity: catalogItem.minOrderQuantity,
          unit: catalogItem.unit,
          supplierName: catalogItem.supplierName,
          type: "catalog",
          phoneNumber,
          buyerName: user.businessName || user.displayName || user.email,
          buyerEmail: user.email,
          buyerPhone: user.phone,
        });
      }

      // Increment inquiry count
      if (type === "deadstock") {
        const { incrementInquiries } = await import("@/lib/services/deadStockListings");
        await incrementInquiries(item.id);
      } else {
        const { incrementCatalogInquiries } = await import("@/lib/services/catalogItems");
        await incrementCatalogInquiries(item.id);
      }

      showSuccess(`Opening WhatsApp to contact ${sellerName}...`);
    } catch (error: any) {
      console.error("Error sending inquiry:", error);
      showError(error.message || "Failed to open WhatsApp. Please contact the seller directly.");
    }
  };

  const handleWhatsAppFromModal = async () => {
    if (!contactModal || !user) return;
    
    try {
      const { sellerId, type, productName, sellerName } = contactModal;
      if (!sellerId || !type) return;

      // Try to get phone number again
      let phoneNumber: string | null = null;
      try {
        const userResponse = await fetch(`/api/user/${sellerId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          phoneNumber = userData.phone;
        }
      } catch (error) {
        console.error("Error fetching seller phone:", error);
      }

      if (!phoneNumber) {
        // Try shop phone
        try {
          const shopsResponse = await fetch(`/api/shops?ownerId=${sellerId}`);
          if (shopsResponse.ok) {
            const shops = await shopsResponse.json();
            if (shops.length > 0 && shops[0].contact?.phone) {
              phoneNumber = shops[0].contact.phone;
            }
          }
        } catch (error) {
          console.error("Error fetching shop phone:", error);
        }
      }

      if (!phoneNumber) {
        showError("Phone number not available. Please use email or other contact methods.");
        return;
      }

      const { sendWhatsAppInquiry } = await import("@/lib/utils/whatsapp");
      
      if (type === "deadstock") {
        const item = deadStockListings.find((l) => l.sellerId === sellerId);
        if (item) {
          await sendWhatsAppInquiry({
            productName: item.productName,
            category: item.category,
            price: item.discountPrice,
            quantity: item.quantity,
            sellerName: item.sellerName,
            type: "deadstock",
            phoneNumber,
            buyerName: user.businessName || user.displayName || user.email,
            buyerEmail: user.email,
            buyerPhone: user.phone,
          });
        }
      } else {
        const item = catalogItems.find((i) => i.supplierId === sellerId);
        if (item) {
          await sendWhatsAppInquiry({
            productName: item.productName,
            category: item.category,
            price: item.price,
            minOrderQuantity: item.minOrderQuantity,
            unit: item.unit,
            supplierName: item.supplierName,
            type: "catalog",
            phoneNumber,
            buyerName: user.businessName || user.displayName || user.email,
            buyerEmail: user.email,
            buyerPhone: user.phone,
          });
        }
      }

      showSuccess(`Opening WhatsApp to contact ${sellerName}...`);
    } catch (error: any) {
      console.error("Error sending WhatsApp:", error);
      showError(error.message || "Failed to open WhatsApp.");
    }
  };

  const handleContact = async (item: DeadStock | CatalogItem, type: "deadstock" | "catalog") => {
    if (!user) {
      showError("Please login to contact sellers");
      router.push("/auth/login?redirect=/marketplace");
      return;
    }

    // Same as inquire - send an inquiry
    await handleInquire(item, type);
  };

  // Filter items based on search and price
  // Filter and sort: Featured items first, then exclude bad suppliers
  const [featuredDeadStock, regularDeadStock] = deadStockListings.reduce(
    (acc, item) => {
      if (item.isFeatured) {
        acc[0].push(item);
      } else {
        acc[1].push(item);
      }
      return acc;
    },
    [[], []] as [DeadStock[], DeadStock[]]
  );

  const filteredDeadStock = [...featuredDeadStock, ...regularDeadStock].filter((item) => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = 
      (!priceRange.min || item.discountPrice >= parseFloat(priceRange.min)) &&
      (!priceRange.max || item.discountPrice <= parseFloat(priceRange.max));

    return matchesSearch && matchesPrice;
  });

  // Filter and sort: Featured items first
  const [featuredCatalog, regularCatalog] = catalogItems.reduce(
    (acc, item) => {
      if (item.isFeatured) {
        acc[0].push(item);
      } else {
        acc[1].push(item);
      }
      return acc;
    },
    [[], []] as [CatalogItem[], CatalogItem[]]
  );

  const filteredCatalog = [...featuredCatalog, ...regularCatalog].filter((item) => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = 
      (!priceRange.min || item.price >= parseFloat(priceRange.min)) &&
      (!priceRange.max || item.price <= parseFloat(priceRange.max));

    return matchesSearch && matchesPrice;
  });

  const allCategories = Array.from(
    new Set([
      ...deadStockListings.map((item) => item.category),
      ...catalogItems.map((item) => item.category),
    ])
  ).sort();

  const allCities = Array.from(
    new Set([
      ...deadStockListings.map((item) => item.location.city),
      ...catalogItems.map((item) => item.supplierName), // Can add location to catalog items later
    ])
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">VyaparOS Marketplace</h1>
            <p className="text-xl text-primary-100 mb-6">
              Connect, Trade, and Grow Your Business
            </p>
            <p className="text-primary-200 max-w-2xl mx-auto">
              Browse dead stock listings, discover catalog items, and connect with wholesalers and retailers across Central India
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">{deadStockListings.length}</div>
              <div className="text-sm text-gray-600">Dead Stock Listings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{catalogItems.length}</div>
              <div className="text-sm text-gray-600">Catalog Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{allCategories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{allCities.length}</div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === "all"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Listings ({deadStockListings.length + catalogItems.length})
              </button>
              <button
                onClick={() => setActiveTab("deadstock")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === "deadstock"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Package className="inline h-4 w-4 mr-2" />
                Dead Stock ({deadStockListings.length})
              </button>
              <button
                onClick={() => setActiveTab("catalog")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === "catalog"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <ShoppingBag className="inline h-4 w-4 mr-2" />
                Catalog ({catalogItems.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                value={locationFilter.city}
                onChange={(e) => setLocationFilter({ ...locationFilter, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Cities</option>
                {allCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price (₹)
              </label>
              <input
                type="number"
                placeholder="10000"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Featured Dead Stock Section */}
        {featuredDeadStock.length > 0 && (activeTab === "all" || activeTab === "deadstock") && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Package className="h-6 w-6 mr-2 text-yellow-500" />
                ⭐ Featured Dead Stock ({featuredDeadStock.length})
              </h2>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Premium
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDeadStock.map((listing) => (
                <DeadStockCard
                  key={listing.id}
                  listing={listing}
                  onInquire={() => handleInquire(listing, "deadstock")}
                />
              ))}
            </div>
          </div>
        )}

        {/* Featured Catalog Section */}
        {featuredCatalog.length > 0 && (activeTab === "all" || activeTab === "catalog") && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <ShoppingBag className="h-6 w-6 mr-2 text-yellow-500" />
                ⭐ Featured Catalog Items ({featuredCatalog.length})
              </h2>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Premium
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCatalog.map((item) => (
                <CatalogCard
                  key={item.id}
                  item={item}
                  onInquire={() => handleInquire(item, "catalog")}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Dead Stock Listings */}
        {(activeTab === "all" || activeTab === "deadstock") && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="h-6 w-6 mr-2 text-blue-600" />
              Dead Stock Listings ({regularDeadStock.length})
            </h2>
            {regularDeadStock.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularDeadStock.map((listing) => (
                  <DeadStockCard
                    key={listing.id}
                    listing={listing}
                    onInquire={() => handleInquire(listing, "deadstock")}
                  />
                ))}
              </div>
            ) : (
              featuredDeadStock.length === 0 && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No dead stock listings found</p>
                </div>
              )
            )}
          </div>
        )}

        {/* Regular Catalog Items */}
        {(activeTab === "all" || activeTab === "catalog") && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <ShoppingBag className="h-6 w-6 mr-2 text-green-600" />
              Catalog Items ({regularCatalog.length})
            </h2>
            {regularCatalog.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularCatalog.map((item) => (
                  <CatalogCard
                    key={item.id}
                    item={item}
                    onInquire={() => handleInquire(item, "catalog")}
                  />
                ))}
              </div>
            ) : (
              featuredCatalog.length === 0 && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No catalog items found</p>
                </div>
              )
            )}
          </div>
        )}

        {/* Seed Mock Data Button (for development/admin) */}
        {user && (user.role === 'admin' || user.uid === 'dev-user-123') && (
          <div className="mt-12 bg-orange-50 border border-orange-200 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-orange-900 mb-2 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Populate Marketplace
                </h3>
                <p className="text-sm text-orange-700">
                  Add 10 wholesalers and 7 retailers with catalog items and dead stock listings to make the marketplace look active
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    const response = await fetch("/api/seed/mock-users", {
                      method: "POST",
                    });
                    if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.error || "Failed to seed");
                    }
                    const data = await response.json();
                    showSuccess(
                      `Created ${data.counts.wholesalers} wholesalers, ${data.counts.retailers} retailers, ${data.counts.catalogItems} catalog items, and ${data.counts.deadStockListings} dead stock listings!`
                    );
                    // Reload marketplace data
                    await loadMarketplaceData();
                  } catch (error: any) {
                    showError(error.message || "Failed to seed mock users");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 transition whitespace-nowrap"
              >
                {loading ? "Creating..." : "Add Mock Users"}
              </button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        {!user && (
          <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Join the Marketplace</h3>
            <p className="text-primary-100 mb-6">
              Create an account to list your products, connect with buyers, and grow your business
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition"
              >
                Sign Up Free
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-400 transition"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {contactModal && (
        <ContactModal
          isOpen={contactModal.isOpen}
          onClose={() => setContactModal(null)}
          sellerName={contactModal.sellerName}
          sellerEmail={contactModal.sellerEmail}
          sellerPhone={contactModal.sellerPhone}
          productName={contactModal.productName}
          onWhatsApp={handleWhatsAppFromModal}
        />
      )}
    </div>
  );
}


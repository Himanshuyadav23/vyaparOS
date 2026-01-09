"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getDeadStockListings, incrementInquiries, incrementViews } from "@/lib/services/deadStockListings";
import { DeadStock } from "@/types";
import DeadStockCard from "@/components/deadStock/DeadStockCard";
import { Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import ContactModal from "@/components/ui/ContactModal";

export default function BrowseDeadStockPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<DeadStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeadStock["status"] | "">("available");

  useEffect(() => {
    loadListings();
  }, [categoryFilter, statusFilter]);

  const loadListings = async () => {
    try {
      const filters: any = {};
      if (categoryFilter) filters.category = categoryFilter;
      if (statusFilter) filters.status = statusFilter;

      const data = await getDeadStockListings(filters, 50);
      setListings(data);
    } catch (error) {
      console.error("Error loading listings:", error);
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
  } | null>(null);

  const handleInquire = async (listing: DeadStock) => {
    try {
      // Get seller contact information
      let phoneNumber: string | null = null;
      let sellerEmail: string | null = null;
      
      try {
        const userResponse = await fetch(`/api/user/${listing.sellerId}`);
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
          const shopsResponse = await fetch(`/api/shops?ownerId=${listing.sellerId}`);
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

      // If no phone number, show contact modal
      if (!phoneNumber) {
        setContactModal({
          isOpen: true,
          sellerName: listing.sellerName,
          sellerEmail: sellerEmail || undefined,
          sellerPhone: undefined,
          productName: listing.productName,
        });
        return;
      }

      // Get current user info if available
      const currentUser = user ? {
        name: user.businessName || user.displayName || user.email,
        email: user.email,
        phone: user.phone,
      } : undefined;

      // Send WhatsApp inquiry via API
      const { sendWhatsAppInquiry } = await import("@/lib/utils/whatsapp");
      await sendWhatsAppInquiry({
        productName: listing.productName,
        category: listing.category,
        price: listing.discountPrice,
        quantity: listing.quantity,
        sellerName: listing.sellerName,
        type: "deadstock",
        phoneNumber,
        buyerName: currentUser?.name,
        buyerEmail: currentUser?.email,
        buyerPhone: currentUser?.phone,
      });

      // Increment inquiry count
      if (listing.id) {
        await incrementInquiries(listing.id);
      }
    } catch (error: any) {
      console.error("Error opening WhatsApp:", error);
      alert(error.message || "Failed to open WhatsApp. Please contact the seller directly.");
    }
  };

  const handleViewListing = async (listing: DeadStock) => {
    // Increment view count
    if (listing.id) {
      await incrementViews(listing.id);
    }
    // Navigate to detail page or show modal
    router.push(`/dashboard/dead-stock/${listing.id}`);
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const categories = Array.from(new Set(listings.map((l) => l.category))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading listings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Dead Stock</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find great deals on excess inventory
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as DeadStock["status"] | "")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="">All Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              onClick={() => handleViewListing(listing)}
              className="cursor-pointer"
            >
              <DeadStockCard listing={listing} onInquire={handleInquire} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No listings found</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-2 text-primary-600 hover:text-primary-700"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Contact Modal */}
      {contactModal && (
        <ContactModal
          isOpen={contactModal.isOpen}
          onClose={() => setContactModal(null)}
          sellerName={contactModal.sellerName}
          sellerEmail={contactModal.sellerEmail}
          sellerPhone={contactModal.sellerPhone}
          productName={contactModal.productName}
        />
      )}
    </div>
  );
}


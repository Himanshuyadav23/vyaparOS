"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  getDeadStockListings,
  updateDeadStockListing,
  deleteDeadStockListing,
} from "@/lib/services/deadStockListings";
import { DeadStock } from "@/types";
import DeadStockCard from "@/components/deadStock/DeadStockCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Plus, Package, Eye, Search } from "lucide-react";
import Link from "next/link";

export default function DeadStockPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [listings, setListings] = useState<DeadStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      loadListings();
    }
  }, [user]);

  const loadListings = async () => {
    if (!user) return;
    try {
      const data = await getDeadStockListings({ sellerId: user.uid });
      setListings(data);
    } catch (error) {
      console.error("Error loading listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing: DeadStock) => {
    router.push(`/dashboard/dead-stock/edit/${listing.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteDeadStockListing(id);
      showSuccess("Listing deleted successfully");
      loadListings();
    } catch (error) {
      console.error("Error deleting listing:", error);
      showError("Failed to delete listing. Please try again.");
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Dead Stock Listings</h1>
          <p className="mt-2 text-base text-gray-600">
            Manage your excess inventory listings
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/dead-stock/browse"
            className="flex items-center px-5 py-3 text-base border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            <Eye className="h-5 w-5 mr-2" />
            Browse All
          </Link>
          <Link
            href="/dashboard/dead-stock/add"
            className="flex items-center px-5 py-3 text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Listing
          </Link>
        </div>
      </div>

      {/* Search */}
      {listings.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )}

      {/* Listings Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <DeadStockCard
              key={listing.id}
              listing={listing}
              showActions={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            {searchTerm ? "No listings match your search" : "No listings yet"}
          </p>
          {!searchTerm && (
            <Link
              href="/dashboard/dead-stock/add"
              className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Create your first listing
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

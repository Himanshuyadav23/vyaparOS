"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  getCatalogItems,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
} from "@/lib/services/catalogItems";
import { CatalogItem } from "@/types";
import CatalogCard from "@/components/catalog/CatalogCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Plus, ShoppingBag, Share2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
// Shop info can be fetched via API if needed

export default function CatalogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState<string | null>(null);
  const [catalogLink, setCatalogLink] = useState<string>("");
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserShop();
      loadItems();
    }
  }, [user]);

  const loadUserShop = async () => {
    if (!user) return;
    try {
      // Use user ID as shop ID (can be enhanced with shop API later)
      setShopId(user.uid);
      const baseUrl = window.location.origin;
      setCatalogLink(`${baseUrl}/catalog/${user.uid}`);
    } catch (error) {
      console.error("Error loading shop:", error);
    }
  };

  const loadItems = async () => {
    if (!user) return;
    try {
      const data = await getCatalogItems({ supplierId: user.uid });
      setItems(data);
    } catch (error) {
      console.error("Error loading catalog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: CatalogItem) => {
    router.push(`/dashboard/catalog/edit/${item.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this catalog item?")) return;
    try {
      await deleteCatalogItem(id);
      showSuccess("Product deleted successfully");
      loadItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      showError("Failed to delete product. Please try again.");
    }
  };

  const handleShare = async () => {
    if (catalogLink) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "My Product Catalog",
            text: "Check out my product catalog on VyaparOS",
            url: catalogLink,
          });
        } catch (error) {
          // User cancelled or error
        }
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(catalogLink);
        alert("Catalog link copied to clipboard!");
      }
    }
  };

  const copyLink = async () => {
    if (catalogLink) {
      await navigator.clipboard.writeText(catalogLink);
      showSuccess("Catalog link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Digital Catalog</h1>
          <p className="mt-2 text-base text-gray-600">
            Manage and share your product catalog
          </p>
        </div>
        <div className="flex gap-3">
          {catalogLink && (
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share Catalog
            </button>
          )}
          <Link
            href="/dashboard/catalog/add"
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Catalog Link Info */}
      {catalogLink && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-primary-900 mb-1">
                Your Public Catalog Link
              </p>
              <p className="text-sm text-primary-700 break-all">{catalogLink}</p>
            </div>
            <button
              onClick={copyLink}
              className="ml-4 p-2 text-primary-600 hover:bg-primary-100 rounded"
              title="Copy link"
            >
              <LinkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Share Your Catalog</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catalog Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={catalogLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <CatalogCard
              key={item.id}
              item={item}
              showActions={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No catalog items yet</p>
          <Link
            href="/dashboard/catalog/add"
            className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Add your first product
          </Link>
        </div>
      )}
    </div>
  );
}

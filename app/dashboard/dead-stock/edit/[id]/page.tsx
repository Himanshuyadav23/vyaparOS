"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getDeadStockListingById, updateDeadStockListing } from "@/lib/services/deadStockListings";
import { uploadImage, getImagePath } from "@/lib/utils/storage";
import { Upload, X, Loader2 } from "lucide-react";

export default function EditDeadStockPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    description: "",
    quantity: 1,
    minQty: 1,
    originalPrice: 0,
    discountPrice: 0,
    condition: "new" as "new" | "like_new" | "good" | "fair",
    status: "available" as "available" | "reserved" | "sold" | "expired",
    city: "",
    state: "",
  });

  useEffect(() => {
    if (params?.id && user) {
      loadListing();
    }
  }, [params?.id, user]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const listing = await getDeadStockListingById(params?.id as string);
      if (!listing) {
        showError("Listing not found");
        router.push("/dashboard/dead-stock");
        return;
      }

      // Check ownership
      if (listing.sellerId !== user?.uid && user?.role !== "admin") {
        showError("You don't have permission to edit this listing");
        router.push("/dashboard/dead-stock");
        return;
      }

      // Populate form with existing data
      setFormData({
        productName: listing.productName || "",
        category: listing.category || "",
        description: listing.description || "",
        quantity: listing.quantity || 1,
        minQty: listing.minQty || listing.quantity || 1,
        originalPrice: listing.originalPrice || 0,
        discountPrice: listing.discountPrice || 0,
        condition: listing.condition || "new",
        status: (listing.status || "available") as "available" | "reserved" | "sold" | "expired",
        city: listing.location?.city || "",
        state: listing.location?.state || "",
      });

      // Set existing images
      if (listing.images && listing.images.length > 0) {
        setExistingImages(listing.images);
        setImagePreview(listing.images[0]);
      }
    } catch (error) {
      console.error("Error loading listing:", error);
      showError("Failed to load listing");
      router.push("/dashboard/dead-stock");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (existingImages.length > 0) {
      setImagePreview(existingImages[0]);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !params?.id) {
      alert("Please login to continue");
      return;
    }

    setSaving(true);
    try {
      let images = [...existingImages];

      // Upload new image if provided
      if (imageFile) {
        setUploading(true);
        const imagePath = getImagePath("deadStockListings", params.id as string, imageFile.name);
        const imageUrl = await uploadImage(imageFile, imagePath);
        images = [imageUrl]; // Replace with new image
        setUploading(false);
      }

      // Update listing
      await updateDeadStockListing(params.id as string, {
        productName: formData.productName,
        category: formData.category,
        description: formData.description,
        quantity: formData.quantity,
        minQty: formData.minQty,
        originalPrice: formData.originalPrice,
        discountPrice: formData.discountPrice,
        condition: formData.condition,
        images: images,
        location: {
          city: formData.city,
          state: formData.state,
        },
        status: formData.status,
      });

      showSuccess("Listing updated successfully!");
      router.push("/dashboard/dead-stock");
    } catch (error: any) {
      console.error("Error updating listing:", error);
      showError(error.message || "Failed to update listing. Please try again.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Dead Stock Listing</h1>
        <p className="mt-2 text-base text-gray-600">
          Update your listing information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter product name"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <input
            type="text"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Cotton, Silk, Polyester"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Describe the product, condition, and any relevant details"
          />
        </div>

        {/* Price and Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Original Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.originalPrice}
              onChange={(e) =>
                setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.discountPrice}
              onChange={(e) =>
                setFormData({ ...formData, discountPrice: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Quantity *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Order Quantity
            </label>
            <input
              type="number"
              min="1"
              value={formData.minQty}
              onChange={(e) =>
                setFormData({ ...formData, minQty: parseInt(e.target.value) || 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Condition and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition *
            </label>
            <select
              required
              value={formData.condition}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  condition: e.target.value as "new" | "like_new" | "good" | "fair",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "available" | "reserved" | "sold" | "expired",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter state"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          {!imagePreview ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {(saving || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
            {uploading ? "Uploading..." : saving ? "Updating..." : "Update Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}

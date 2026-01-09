"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getCatalogItemById, updateCatalogItem } from "@/lib/services/catalogItems";
import { uploadImage, getImagePath } from "@/lib/utils/storage";
import { Upload, X, Loader2 } from "lucide-react";

export default function EditCatalogItemPage() {
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
    subcategory: "",
    description: "",
    price: 0,
    minOrderQuantity: 1,
    maxOrderQuantity: "",
    stockAvailable: "",
    unit: "units",
    tags: [] as string[],
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    if (params?.id && user) {
      loadItem();
    }
  }, [params?.id, user]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const item = await getCatalogItemById(params?.id as string);
      if (!item) {
        showError("Catalog item not found");
        router.push("/dashboard/catalog");
        return;
      }

      // Check ownership
      if (item.supplierId !== user?.uid && user?.role !== "admin") {
        showError("You don't have permission to edit this item");
        router.push("/dashboard/catalog");
        return;
      }

      // Populate form with existing data
      setFormData({
        productName: item.productName || "",
        category: item.category || "",
        subcategory: item.subcategory || "",
        description: item.description || "",
        price: item.price || 0,
        minOrderQuantity: item.minOrderQuantity || 1,
        maxOrderQuantity: item.maxOrderQuantity?.toString() || "",
        stockAvailable: item.stockAvailable?.toString() || "",
        unit: item.unit || "units",
        tags: item.tags || [],
        isActive: item.isActive !== undefined ? item.isActive : true,
        isFeatured: item.isFeatured || false,
      });

      // Set existing images
      if (item.images && item.images.length > 0) {
        setExistingImages(item.images);
        setImagePreview(item.images[0]);
      }
    } catch (error) {
      console.error("Error loading catalog item:", error);
      showError("Failed to load catalog item");
      router.push("/dashboard/catalog");
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
        const imagePath = getImagePath("catalogItems", params.id as string, imageFile.name);
        const imageUrl = await uploadImage(imageFile, imagePath);
        images = [imageUrl]; // Replace with new image
        setUploading(false);
      }

      // Update catalog item
      await updateCatalogItem(params.id as string, {
        productName: formData.productName,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        description: formData.description,
        price: formData.price,
        minOrderQuantity: formData.minOrderQuantity,
        maxOrderQuantity: formData.maxOrderQuantity
          ? parseInt(formData.maxOrderQuantity)
          : undefined,
        stockAvailable: formData.stockAvailable
          ? parseInt(formData.stockAvailable)
          : undefined,
        unit: formData.unit,
        images: images,
        tags: formData.tags,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      });

      showSuccess("Catalog item updated successfully!");
      router.push("/dashboard/catalog");
    } catch (error: any) {
      console.error("Error updating catalog item:", error);
      showError(error.message || "Failed to update catalog item. Please try again.");
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Catalog Item</h1>
        <p className="mt-2 text-base text-gray-600">
          Update your product information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter product name"
          />
        </div>

        {/* Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="e.g., Cotton, Silk"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory
            </label>
            <input
              type="text"
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Optional"
            />
          </div>
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
            placeholder="Describe the product, specifications, and features"
          />
        </div>

        {/* Price and Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Order Qty *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.minOrderQuantity}
              onChange={(e) =>
                setFormData({ ...formData, minOrderQuantity: parseInt(e.target.value) || 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="units">Units</option>
              <option value="meters">Meters</option>
              <option value="kg">Kg</option>
              <option value="pieces">Pieces</option>
              <option value="rolls">Rolls</option>
            </select>
          </div>
        </div>

        {/* Stock and Max Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Available
            </label>
            <input
              type="number"
              min="0"
              value={formData.stockAvailable}
              onChange={(e) => setFormData({ ...formData, stockAvailable: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Order Quantity
            </label>
            <input
              type="number"
              min="0"
              value={formData.maxOrderQuantity}
              onChange={(e) => setFormData({ ...formData, maxOrderQuantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., premium, cotton, wholesale"
          />
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

        {/* Options */}
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Active (visible in catalog)</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Featured (show prominently)</span>
          </label>
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
            {uploading ? "Uploading..." : saving ? "Updating..." : "Update Item"}
          </button>
        </div>
      </form>
    </div>
  );
}

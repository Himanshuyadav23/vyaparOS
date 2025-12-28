"use client";

import { CatalogItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Package, ShoppingBag, Eye, MessageCircle, Star } from "lucide-react";

interface CatalogCardProps {
  item: CatalogItem;
  showActions?: boolean;
  onEdit?: (item: CatalogItem) => void;
  onDelete?: (id: string) => void;
  onInquire?: (item: CatalogItem) => void;
}

export default function CatalogCard({
  item,
  showActions = false,
  onEdit,
  onDelete,
  onInquire,
}: CatalogCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
        )}
        {item.isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </div>
        )}
        {!item.isActive && (
          <div className="absolute top-2 left-2 bg-gray-500 text-white px-2 py-1 rounded-md text-xs font-medium">
            Inactive
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {item.productName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">{item.category}</span>
            {item.subcategory && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{item.subcategory}</span>
              </>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <p className="text-xl font-bold text-primary-600">
            {formatCurrency(item.price)}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
            <span>Min Order: {item.minOrderQuantity} {item.unit || "units"}</span>
            {item.stockAvailable !== undefined && (
              <span>Stock: {item.stockAvailable}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {item.description}
        </p>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {item.views !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{item.views}</span>
            </div>
          )}
          {item.inquiries !== undefined && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{item.inquiries}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xs text-gray-400">
            {item.supplierName}
          </span>
          <div className="flex gap-2">
            {showActions && onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded"
              >
                Edit
              </button>
            )}
            {showActions && onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            )}
            {!showActions && onInquire && (
              <button
                onClick={() => onInquire(item)}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                Inquire
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


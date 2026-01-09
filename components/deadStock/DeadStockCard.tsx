"use client";

import { DeadStock } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, MapPin, Eye, MessageCircle } from "lucide-react";

interface DeadStockCardProps {
  listing: DeadStock;
  showActions?: boolean;
  onEdit?: (listing: DeadStock) => void;
  onDelete?: (id: string) => void;
  onInquire?: (listing: DeadStock) => void;
}

export default function DeadStockCard({
  listing,
  showActions = false,
  onEdit,
  onDelete,
  onInquire,
}: DeadStockCardProps) {
  // Calculate discount percentage, ensuring it's a positive number
  let discountPercent = 0;
  if (listing.discountPercent) {
    // If it's already a number, use it; if it's a string, parse it
    discountPercent = typeof listing.discountPercent === 'string'
      ? parseFloat((listing.discountPercent as string).replace('%', ''))
      : Math.abs(listing.discountPercent || 0);
  } else if (listing.originalPrice > 0 && listing.discountPrice < listing.originalPrice) {
    discountPercent = Math.abs(((listing.originalPrice - listing.discountPrice) / listing.originalPrice) * 100);
  }

  const getStatusColor = (status: DeadStock["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        )}
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
            {Math.round(discountPercent)}% OFF
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
              listing.status
            )}`}
          >
            {listing.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {listing.productName}
          </h3>
          <p className="text-sm text-gray-500">{listing.category}</p>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-600">
              {formatCurrency(listing.discountPrice)}
            </span>
            {listing.originalPrice > listing.discountPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(listing.originalPrice)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Min Qty: {listing.minQty || listing.quantity} units
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {listing.description}
        </p>

        {/* Details */}
        <div className="space-y-1 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            <span>Qty: {listing.quantity}</span>
            {listing.condition && (
              <span className="ml-2">• Condition: {listing.condition.replace("_", " ")}</span>
            )}
          </div>
          {listing.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>
                {listing.location.city}, {listing.location.state}
              </span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {listing.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{listing.views} views</span>
              </div>
            )}
            {listing.inquiries !== undefined && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{listing.inquiries} inquiries</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xs text-gray-400">
            {formatDate(listing.createdAt)}
          </span>
          <div className="flex gap-2">
            {showActions && onEdit && (
              <button
                onClick={() => onEdit(listing)}
                className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded"
              >
                Edit
              </button>
            )}
            {showActions && onDelete && (
              <button
                onClick={() => onDelete(listing.id)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            )}
            {!showActions && onInquire && (
              <button
                onClick={() => onInquire(listing)}
                className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors"
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


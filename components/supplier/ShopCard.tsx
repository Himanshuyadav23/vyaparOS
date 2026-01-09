"use client";

import { Shop } from "@/types";
import { MapPin, Star, Phone, Mail, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

interface ShopCardProps {
  shop: Shop;
  onContact?: (shop: Shop) => void;
}

export default function ShopCard({ shop, onContact }: ShopCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">{shop.shopName}</h3>
              {shop.verified && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs">
                {shop.shopType}
              </span>
              {shop.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{shop.rating.toFixed(1)}</span>
                  <span className="text-gray-400">
                    ({shop.totalRatings})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-4 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p>{shop.address.street}</p>
            <p>
              {shop.address.city}, {shop.address.state} - {shop.address.pincode}
            </p>
          </div>
        </div>

        {/* Categories */}
        {shop.categories.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Categories</p>
            <div className="flex flex-wrap gap-1">
              {shop.categories.slice(0, 5).map((cat, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {cat}
                </span>
              ))}
              {shop.categories.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{shop.categories.length - 5}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Specialties */}
        {shop.specialties && shop.specialties.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Specialties</p>
            <div className="flex flex-wrap gap-1">
              {shop.specialties.slice(0, 3).map((spec, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2 mb-4 text-sm">
          {shop.contact.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <a
                href={`tel:${shop.contact.phone}`}
                className="hover:text-primary-600"
              >
                {shop.contact.phone}
              </a>
            </div>
          )}
          {shop.contact.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <a
                href={`mailto:${shop.contact.email}`}
                className="hover:text-primary-600"
              >
                {shop.contact.email}
              </a>
            </div>
          )}
        </div>

        {/* Business Hours */}
        {shop.businessHours && Object.keys(shop.businessHours).length > 0 && (
          <div className="mb-4 text-xs text-gray-500">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="h-3 w-3" />
              <span className="font-medium">Business Hours</span>
            </div>
            <div className="pl-4">
              {Object.entries(shop.businessHours)
                .slice(0, 2)
                .map(([day, hours]) => (
                  <div key={day}>
                    {day}: {hours.closed ? "Closed" : `${hours.open} - ${hours.close}`}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Link
            href={`/discover/${shop.shopId}`}
            className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 text-center transition-colors"
          >
            View Profile
          </Link>
          {onContact && (
            <button
              onClick={() => onContact(shop)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Contact
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


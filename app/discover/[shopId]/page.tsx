"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getShopById, getShops } from "@/lib/services/shops";
import { getCatalogItems } from "@/lib/services/catalogItems";
import { Shop, CatalogItem } from "@/types";
import { MapPin, Star, Phone, Mail, CheckCircle, Clock, ArrowLeft, ShoppingBag } from "lucide-react";
import Loading from "@/components/ui/Loading";
import CatalogCard from "@/components/catalog/CatalogCard";

export default function ShopProfilePage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.shopId as string;
  const [shop, setShop] = useState<Shop | null>(null);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (shopId) {
      loadShopProfile();
    }
  }, [shopId]);

  const loadShopProfile = async () => {
    try {
      const [shopData, items] = await Promise.all([
        getShopById(shopId),
        getCatalogItems({ shopId, isActive: true }, 20),
      ]);

      if (!shopData) {
        setError("Shop not found");
        return;
      }

      setShop(shopData);
      setCatalogItems(items);
    } catch (err) {
      console.error("Error loading shop profile:", err);
      setError("Failed to load shop profile");
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!shop) return;

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

  if (loading) {
    return <Loading />;
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Shop not found"}
          </h1>
          <button
            onClick={() => router.push("/discover")}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{shop.shopName}</h1>
                {shop.verified && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full">
                  {shop.shopType}
                </span>
                {shop.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{shop.rating.toFixed(1)}</span>
                    <span className="text-gray-400">({shop.totalRatings} ratings)</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleContact}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
            >
              Contact Supplier
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                  <div className="flex items-start gap-2 text-gray-700">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p>{shop.address.street}</p>
                      <p>
                        {shop.address.city}, {shop.address.state} - {shop.address.pincode}
                      </p>
                      <p>{shop.address.country}</p>
                    </div>
                  </div>
                </div>

                {shop.categories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {shop.categories.map((cat, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {shop.specialties && shop.specialties.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {shop.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {shop.businessHours && Object.keys(shop.businessHours).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Business Hours</h3>
                    <div className="space-y-1 text-sm text-gray-700">
                      {Object.entries(shop.businessHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium capitalize w-24">{day}:</span>
                          <span>
                            {hours.closed
                              ? "Closed"
                              : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Catalog Items */}
            {catalogItems.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catalogItems.map((item) => (
                    <CatalogCard key={item.id} item={item} />
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <a
                    href={`/catalog/${shopId}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Full Catalog →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                {shop.contact.phone && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Phone className="h-4 w-4" />
                      <span>Phone</span>
                    </div>
                    <a
                      href={`tel:${shop.contact.phone}`}
                      className="text-gray-900 hover:text-primary-600 font-medium"
                    >
                      {shop.contact.phone}
                    </a>
                    {shop.contact.alternatePhone && (
                      <div>
                        <a
                          href={`tel:${shop.contact.alternatePhone}`}
                          className="text-gray-600 hover:text-primary-600 text-sm"
                        >
                          {shop.contact.alternatePhone}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {shop.contact.email && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <a
                      href={`mailto:${shop.contact.email}`}
                      className="text-gray-900 hover:text-primary-600 font-medium break-all"
                    >
                      {shop.contact.email}
                    </a>
                  </div>
                )}

                <button
                  onClick={handleContact}
                  className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium"
                >
                  Contact via WhatsApp
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rating</span>
                  <span className="font-medium">
                    {shop.rating > 0 ? `${shop.rating.toFixed(1)} / 5.0` : "No ratings yet"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Ratings</span>
                  <span className="font-medium">{shop.totalRatings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Products</span>
                  <span className="font-medium">{catalogItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`font-medium ${
                      shop.isActive ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {shop.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


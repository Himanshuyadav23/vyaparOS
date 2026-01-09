"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, Building2, Shield, Calendar, Edit2, Save, X } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    businessName: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        businessName: user.businessName || "",
        phone: user.phone || "",
        address: user.address || {
          street: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
        },
      });
      setLoading(false);
    } else {
      router.push("/auth/login");
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to update profile" }));
        throw new Error(errorData.error || "Failed to update profile");
      }

      await refreshUser();
      setEditing(false);
      showSuccess("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        businessName: user.businessName || "",
        phone: user.phone || "",
        address: user.address || {
          street: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
        },
      });
    }
    setEditing(false);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-base text-gray-600">
            Manage your account information and settings
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Edit2 className="h-5 w-5 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <User className="h-5 w-5 mr-2 text-primary-600" />
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            {editing ? (
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Your display name"
              />
            ) : (
              <div className="flex items-center text-gray-900">
                <User className="h-5 w-5 mr-2 text-gray-400" />
                {formData.displayName || "Not set"}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center text-gray-900">
              <Mail className="h-5 w-5 mr-2 text-gray-400" />
              {user.email}
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            {editing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="+91 9876543210"
              />
            ) : (
              <div className="flex items-center text-gray-900">
                <Phone className="h-5 w-5 mr-2 text-gray-400" />
                {formData.phone || "Not set"}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <div className="flex items-center text-gray-900">
              <Building2 className="h-5 w-5 mr-2 text-gray-400" />
              {user.businessType?.charAt(0).toUpperCase() + user.businessType?.slice(1) || "N/A"}
            </div>
            <p className="text-xs text-gray-500 mt-1">Business type cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-primary-600" />
          Business Information
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            {editing ? (
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Your business name"
                required
              />
            ) : (
              <div className="flex items-center text-gray-900">
                <Building2 className="h-5 w-5 mr-2 text-gray-400" />
                {formData.businessName}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            {editing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Street address"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="State"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Pincode"
                  />
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Country"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-start text-gray-900">
                <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-1" />
                <div>
                  {formData.address.street && <div>{formData.address.street}</div>}
                  {(formData.address.city || formData.address.state || formData.address.pincode) && (
                    <div>
                      {formData.address.city && `${formData.address.city}, `}
                      {formData.address.state && `${formData.address.state} `}
                      {formData.address.pincode}
                    </div>
                  )}
                  {formData.address.country && <div>{formData.address.country}</div>}
                  {!formData.address.street && !formData.address.city && !formData.address.state && (
                    <div className="text-gray-500">No address set</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary-600" />
          Account Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Status
            </label>
            <div className="flex items-center">
              {user.verified ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Pending Verification
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="flex items-center text-gray-900">
              <Shield className="h-5 w-5 mr-2 text-gray-400" />
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || "User"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Since
            </label>
            <div className="flex items-center text-gray-900">
              <Calendar className="h-5 w-5 mr-2 text-gray-400" />
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Login
            </label>
            <div className="flex items-center text-gray-900">
              <Calendar className="h-5 w-5 mr-2 text-gray-400" />
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

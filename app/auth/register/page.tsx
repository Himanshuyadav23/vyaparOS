"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { User } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessName: "",
    businessType: "wholesaler" as User["businessType"],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        businessName: formData.businessName,
        businessType: formData.businessType,
      });
      showSuccess("Account created successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      showError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl md:text-4xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-3 text-center text-base text-gray-600">
            Join VyaparOS today
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="businessName" className="block text-base font-semibold text-gray-700 mb-2">
                Business Name
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="businessType" className="block text-base font-semibold text-gray-700 mb-2">
                Business Type
              </label>
              <select
                id="businessType"
                name="businessType"
                required
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value as User["businessType"] })}
                className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="wholesaler">Wholesaler</option>
                <option value="retailer">Retailer</option>
                <option value="manufacturer">Manufacturer</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-base text-primary-600 hover:text-primary-700 font-medium"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

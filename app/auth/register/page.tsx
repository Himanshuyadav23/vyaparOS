"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { User } from "@/types";
import { loadGoogleScript, initializeGoogleSignIn } from "@/lib/auth/google";

export default function RegisterPage() {
  const router = useRouter();
  const { user, register } = useAuth();
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessName: "",
    businessType: "wholesaler" as User["businessType"],
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Redirect if already logged in
  if (user) {
    router.push("/dashboard");
    return null;
  }

  useEffect(() => {
    // Initialize Google Sign-In
    const initGoogle = async () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn("Google Client ID not configured");
        return;
      }

      try {
        await loadGoogleScript();
        await initializeGoogleSignIn(clientId, handleGoogleCallback);
        
        // Render button
        if (googleButtonRef.current && window.google?.accounts) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signup_with',
          });
        }
      } catch (error) {
        console.error("Failed to initialize Google Sign-In:", error);
      }
    };

    initGoogle();
  }, []);

  const handleGoogleCallback = async (response: any) => {
    if (!response.credential) {
      showError("Google sign-up failed");
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential, isSignUp: true }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Google sign-up failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      
      showSuccess("Account created successfully with Google!");
      window.location.href = "/dashboard";
    } catch (err: any) {
      showError(err.message || "Google sign-up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                Business Type
              </label>
              <select
                id="businessType"
                name="businessType"
                required
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value as User["businessType"] })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
              disabled={loading || googleLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Register"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div id="google-signup-button" ref={googleButtonRef}></div>
            {googleLoading && (
              <div className="text-center text-sm text-gray-500">
                Creating account with Google...
              </div>
            )}
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


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { register, loginWithGoogle } from "@/lib/firebase/auth";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { User } from "@/types";
import { Chrome } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessName: "",
    businessType: "wholesaler" as User["businessType"],
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await register(formData.email, formData.password);
      const user = userCredential.user;

      // Create user document in Firestore
      const userData: Omit<User, "uid"> = {
        email: user.email!,
        businessName: formData.businessName,
        businessType: formData.businessType,
        role: formData.businessType === "wholesaler" ? "wholesaler" : "retailer",
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db!, "users", user.uid), {
        ...userData,
        uid: user.uid, // Required by security rules
      });
      showSuccess("Account created successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      showError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      const user = result.user;

      // Check if user document exists
      if (db) {
        if (!db) {
          showError("Database not initialized");
          return;
        }
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
          // Create user document for first-time Google sign-up
          const userData: Omit<User, "uid"> = {
            email: user.email || "",
            displayName: user.displayName || "",
            businessName: user.displayName || formData.businessName || "New Business",
            businessType: formData.businessType,
            role: formData.businessType === "wholesaler" ? "wholesaler" : "retailer",
            verified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await setDoc(doc(db, "users", user.uid), {
            ...userData,
            uid: user.uid, // Required by security rules
          });
        }
      }

      // Wait a bit for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess("Account created successfully with Google!");
      // Use window.location for a full page reload to ensure auth state is updated
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Google sign-up error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        showError("Sign-up popup was closed. Please try again.");
      } else if (err.code === "auth/popup-blocked") {
        showError("Popup was blocked. Please allow popups and try again.");
      } else if (err.code === "auth/email-already-in-use" || err.code === "auth/account-exists-with-different-credential") {
        // Account already exists - redirect to login
        const email = err.customData?.email || err.email;
        showError("This email is already registered. Redirecting to login page...");
        setTimeout(() => {
          if (email) {
            router.push(`/auth/login?email=${encodeURIComponent(email)}`);
          } else {
            router.push("/auth/login");
          }
        }, 2000);
      } else {
        showError(err.message || "Google sign-up failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
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

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {googleLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <Chrome className="h-5 w-5" />
                  Sign up with Google
                </>
              )}
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


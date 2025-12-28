"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { login, loginWithGoogle } from "@/lib/firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User } from "@/types";
import Link from "next/link";
import { Chrome } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      showSuccess("Login successful!");
      router.push("/dashboard");
    } catch (err: any) {
      showError(err.message || "Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      const user = result.user;

      // Check if user document exists
      if (db) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (!userDoc.exists()) {
            // Create user document for first-time Google login
            const userData: Omit<User, "uid"> = {
              email: user.email || "",
              displayName: user.displayName || "",
              businessName: user.displayName || "New Business",
              businessType: "wholesaler",
              role: "wholesaler",
              verified: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            try {
              await setDoc(doc(db, "users", user.uid), {
                ...userData,
                uid: user.uid, // Required by security rules
              });
              console.log("User document created successfully");
            } catch (docError: any) {
              console.error("Error creating user document:", docError);
              showError(`Failed to create user profile: ${docError.message}`);
              return; // Don't redirect if document creation fails
            }
          } else {
            console.log("User document already exists");
          }
        } catch (firestoreError: any) {
          console.error("Firestore error:", firestoreError);
          showError(`Database error: ${firestoreError.message}`);
          return;
        }
      } else {
        showError("Database not initialized. Please refresh the page.");
        return;
      }

      // Wait a bit for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess("Login successful with Google!");
      // Use window.location for a full page reload to ensure auth state is updated
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Google login error:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));
      
      // Handle account exists with different credential or email already in use
      if (err.code === "auth/account-exists-with-different-credential" || err.code === "auth/email-already-in-use") {
        // Try to extract email from various error properties
        const email = err.customData?.email || (err as any).email || err.email;
        if (email) {
          // Pre-fill email and show message
          setEmail(email);
          showError(`This email is registered with email/password. Please enter your password below to sign in.`);
        } else {
          showError("This email is already registered with email/password. Please use the email/password form to sign in.");
        }
      } else if (err.code === "auth/popup-closed-by-user") {
        showError("Sign-in popup was closed. Please try again.");
      } else if (err.code === "auth/popup-blocked") {
        showError("Popup was blocked. Please allow popups and try again.");
      } else {
        showError(err.message || "Google login failed. Please try again.");
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
            VyaparOS
          </h2>
          <p className="mt-3 text-center text-base text-gray-600">
            Sign in to your account
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
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
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {googleLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <Chrome className="h-5 w-5" />
                  Sign in with Google
                </>
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link
              href="/auth/register"
              className="block text-base text-primary-600 hover:text-primary-700 font-medium"
            >
              Don't have an account? Register
            </Link>
            <Link
              href="/demo"
              className="block text-base text-green-600 hover:text-green-700 font-medium"
            >
              Try Demo Mode →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


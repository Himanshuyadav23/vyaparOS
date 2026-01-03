"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import Loading from "@/components/ui/Loading";
import { loadGoogleScript, initializeGoogleSignIn } from "@/lib/auth/google";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, router, authLoading]);

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
            text: 'signin_with',
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
      showError("Google sign-in failed");
      return;
    }

    setGoogleLoading(true);
    try {
      // Clear any existing token first
      localStorage.removeItem("token");
      
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential, isSignUp: false }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Google login failed");
      }

      const data = await res.json();
      // Set new token
      localStorage.setItem("token", data.token);
      
      // Refresh auth context and redirect
      window.location.href = "/dashboard";
    } catch (err: any) {
      showError(err.message || "Google login failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      showSuccess("Login successful!");
      // Use window.location to ensure full page reload and auth state refresh
      window.location.href = "/dashboard";
    } catch (err: any) {
      showError(err.message || "Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth or redirecting
  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

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

            <div id="google-signin-button" ref={googleButtonRef}></div>
            {googleLoading && (
              <div className="text-center text-sm text-gray-500">
                Signing in with Google...
              </div>
            )}
          </div>

          <div className="text-center space-y-2">
            <Link
              href="/auth/register"
              className="block text-base text-primary-600 hover:text-primary-700 font-medium"
            >
              Don&apos;t have an account? Register
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


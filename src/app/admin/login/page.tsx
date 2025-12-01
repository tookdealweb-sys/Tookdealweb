"use client";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clearAllSupabaseCookies = () => {
      const cookies = document.cookie.split(';');
      
      cookies.forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();
        
        if (cookieName.startsWith('sb-') || 
            cookieName.includes('supabase') || 
            cookieName.includes('auth') ||
            cookieName.includes('token')) {
          
          const paths = ['/', '/admin/login', '/admin'];
          const domains = [
            window.location.hostname,
            `.${window.location.hostname}`,
            ''
          ];
          
          paths.forEach(path => {
            domains.forEach(domain => {
              if (domain) {
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
              } else {
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
              }
            });
          });
        }
      });
      
      localStorage.clear();
      sessionStorage.clear();
    };

    clearAllSupabaseCookies();
    supabase.auth.signOut();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const userRole = data.user?.user_metadata?.role;
      const userEmail = data.user?.email;
      
      if (userRole !== "admin" && userEmail !== "admin@tookdeal.com") {
        await supabase.auth.signOut();
        setError("Access denied. This portal is for administrators only.");
        setLoading(false);
        return;
      }

      console.log("✅ Admin login successful");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.replace("/admin");
      
    } catch (err: any) {
      console.error("❌ Admin login error:", err);
      setError(err.message || "An error occurred during login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 px-4">
      <div className="max-w-md w-full">
        {/* Admin Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full shadow-lg">
            <Shield className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm">Admin Portal</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Administrator Access
            </h1>
            <p className="text-sm text-gray-600">
              Enter your credentials to access the admin dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 pr-12 transition-all"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Access Admin Dashboard"
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Shield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-900 font-semibold mb-1">
                  Restricted Access
                </p>
                <p className="text-xs text-gray-600">
                  This portal is for authorized administrators only. All login attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>

          {/* User Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Not an admin?{" "}
              <button
                type="button"
                onClick={() => window.location.href = "/login"}
                className="text-gray-900 hover:text-gray-700 font-semibold transition-colors"
              >
                Go to user login
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Protected by TookDeal Security • All rights reserved
        </p>
      </div>
    </div>
  );
}
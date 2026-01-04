"use client";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);

  // Track user login in the database
  const trackLogin = async (userId: string, userEmail: string) => {
    try {
      await supabase.from('user_login_logs').insert({
        user_id: userId,
        user_email: userEmail,
        user_agent: navigator.userAgent,
      });
      console.log('✅ Login tracked successfully');
    } catch (error) {
      console.error('❌ Error tracking login:', error);
    }
  };

  // Handle OAuth callback on mount
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check if this is an OAuth callback
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);
      
      const hasOAuthParams = 
        hashParams.has('access_token') || 
        searchParams.has('code') ||
        hashParams.has('error');

      if (hasOAuthParams) {
        setIsOAuthCallback(true);
        console.log('🔄 Processing OAuth callback...');

        try {
          // Wait a bit for Supabase to process the session
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get the session after OAuth redirect
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('OAuth session error:', sessionError);
            setError('Authentication failed. Please try again.');
            setIsOAuthCallback(false);
            return;
          }

          if (session?.user) {
            console.log('✅ OAuth session found:', session.user.email);
            
            // Track the login
            await trackLogin(session.user.id, session.user.email || '');
            
            // Wait to ensure session is fully saved
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Clean URL and redirect
            window.history.replaceState({}, document.title, '/login');
            window.location.replace('/dashboard');
          } else {
            console.log('⚠️ No session found after OAuth');
            setIsOAuthCallback(false);
          }
        } catch (error) {
          console.error('Error handling OAuth callback:', error);
          setError('Authentication failed. Please try again.');
          setIsOAuthCallback(false);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  // Clear cookies only when NOT handling OAuth callback
  useEffect(() => {
    if (isOAuthCallback) {
      console.log('⏭️ Skipping cookie clearing due to OAuth callback');
      return;
    }

    const clearAllSupabaseCookies = () => {
      const cookies = document.cookie.split(";");

      console.log(`🍪 Total cookies found: ${cookies.length}`);
      let clearedCount = 0;

      cookies.forEach((cookie) => {
        const cookieName = cookie.split("=")[0].trim();

        if (
          cookieName.startsWith("sb-") ||
          cookieName.includes("supabase") ||
          cookieName.includes("auth") ||
          cookieName.includes("token")
        ) {
          const paths = ["/", "/login", "/dashboard", "/admin"];
          const domains = [
            window.location.hostname,
            `.${window.location.hostname}`,
            "",
          ];

          paths.forEach((path) => {
            domains.forEach((domain) => {
              if (domain) {
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
              } else {
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
              }
            });
          });

          clearedCount++;
          console.log(`🧹 Cleared cookie: ${cookieName}`);
        }
      });

      console.log(`✅ Cleared ${clearedCount} Supabase cookies`);

      localStorage.clear();
      sessionStorage.clear();
    };

    clearAllSupabaseCookies();
    supabase.auth.signOut();
  }, [isOAuthCallback]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlesignup = () => {
    window.location.href = "/signup";
  };

  const handleLogin = async (e: React.FormEvent) => {
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

      if (data?.user) {
        await trackLogin(data.user.id, data.user.email || email);
      }

      console.log("✅ Login successful");
      // Give Supabase time to set the session properly
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Force a hard redirect to ensure session is loaded on the next page
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        setError(error.message);
      }
    } catch (err: any) {
      console.error('Google OAuth exception:', err);
      setError(err.message || 'Failed to initiate Google sign-in');
    }
  };

  // Show loading state during OAuth callback
  if (isOAuthCallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4ad] mx-auto mb-4"></div>
          <p className="text-gray-600">Completing sign-in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="./images/Rectangle 2756.png"
          alt="Man using smartphone"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center mb-12">
            <img
              className="h-10 w-auto object-contain"
              src="./images/Frame 1.png"
              alt="TookDeal Logo"
            />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Get Your Shop Online in Minutes
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500"
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
                  placeholder="Enter password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 pr-12"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-418f80-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => (window.location.href = "/forgotpassword")}
                className="text-sm text-[#00d4ad] hover:text-[#418f80]"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00d4ad] hover:bg-[#418f80] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-white hover:bg-gray-418f80 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm transition-colors duration-200 shadow-sm"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g fill="none" fillRule="evenodd">
                <path
                  d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </g>
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              No account?{" "}
              <button
                onClick={handlesignup}
                className="text-[#00d4ad] hover:text-[#418f80] font-medium cursor-pointer"
              >
                Create an account
              </button>
            </p>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By signing up, you agree to our{" "}
              <button className="text-[#00d4ad] hover:text-[#418f80]">
                Terms
              </button>{" "}
              and{" "}
              <button className="text-[#00d4ad] hover:text-[#418f80]">
                Privacy
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
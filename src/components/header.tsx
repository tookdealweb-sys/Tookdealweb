"use client";
import React, { useState, useEffect, useRef } from "react";
import { Bell, Heart, ChevronDown, User, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface UserData {
  id: string;
  email: string | undefined;
  username: string;
  avatar_url: string | null;
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });

      if (error) {
        console.error("Supabase signout error:", error);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);

      try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith("sb-")) {
            localStorage.removeItem(key);
          }
        });
      } catch (storageError) {
        console.error("Error clearing storage:", storageError);
      }

      window.location.href = "/";
    }
  };

  const handleViewProfile = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    window.location.href = "/profile";
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper function to extract display name from user data
  const getDisplayName = (user: any): string => {
    // Priority order: full_name > name > username > email prefix > "User"
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.username ||
      user.email?.split("@")[0] ||
      "User"
    );
  };

  // Helper function to get avatar URL
  const getAvatarUrl = (user: any): string | null => {
    return (
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null
    );
  };

  // Fetch user data and set up auth listener
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First, try to get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
        }

        if (mounted) {
          if (session?.user) {
            console.log("✅ User session found:", session.user.email);
            setIsLoggedIn(true);
            setUser({
              id: session.user.id,
              email: session.user.email,
              username: getDisplayName(session.user),
              avatar_url: getAvatarUrl(session.user),
            });
          } else {
            console.log("❌ No user session found");
            setIsLoggedIn(false);
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setIsLoggedIn(false);
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Initialize auth immediately
    initializeAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event);

      if (mounted) {
        if (session?.user) {
          console.log("✅ User authenticated:", session.user.email);
          setIsLoggedIn(true);
          setUser({
            id: session.user.id,
            email: session.user.email,
            username: getDisplayName(session.user),
            avatar_url: getAvatarUrl(session.user),
          });
        } else {
          console.log("❌ User signed out");
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 w-full bg-white shadow-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white shadow-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              className="h-11 w-auto object-contain hover:opacity-80 transition-opacity"
              src="/images/Frame 1.png"
              alt="TookDeal Logo"
            />
          </Link>

          {/* Navigation Menu - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Home
            </Link>
           
            <Link
              href="/services"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Services
            </Link>
            <Link
              href="/help"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Help Center
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Right Side Icons - Desktop Only */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notification Bell with Badge */}
            

            {/* Heart Icon */}
            <Link
              href="/favorites"
              className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
              aria-label="Favorites"
            >
              <Heart className="h-5 w-5 text-gray-700" />
            </Link>

            {/* Profile Avatar or Login Button */}
            <div className="relative" ref={dropdownRef}>
              {isLoggedIn && user ? (
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-teal-600 rounded-full flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt="User"
                            className="rounded-full w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className="text-gray-700 font-medium">
                        Hey, {user.username}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-500 transform transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={handleViewProfile}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>View Profile</span>
                      </button>
                      <hr className="border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 pt-4 pb-4 space-y-1 bg-white border-t border-gray-200 shadow-lg">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
            >
              Home
            </Link>
            
            <Link
              href="/services"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
            >
              Services
            </Link>
            <Link
              href="/help"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
            >
              Help Center
            </Link>
            <Link
              href="/about"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
            >
              About
            </Link>

            {/* Mobile Icons Section */}
            <div className="flex items-center justify-start space-x-3 px-4 py-3">
              {/* Notification Bell */}
              

              {/* Heart Icon */}
              <Link
                href="/favorites"
                className="p-2 text-gray-600 hover:text-gray-900 flex  transition-colors rounded-lg hover:bg-gray-100"
                aria-label="Favorites"
              >Favorites
                <Heart className="h-6 w-6 p-1" />
              </Link>
            </div>

            {/* Mobile User Section */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              {isLoggedIn && user ? (
                <div className="space-y-2">
                  <div className="px-4 py-3 flex items-center space-x-3 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 bg-teal-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="User"
                          className="rounded-full w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <span className="text-gray-700 font-medium text-base">
                      Hey, {user.username}
                    </span>
                  </div>
                  <button
                    onClick={handleViewProfile}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors flex items-center space-x-3"
                  >
                    <User className="h-5 w-5" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium rounded-lg transition-colors flex items-center space-x-3"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="px-4">
                  <button
                    onClick={handleLogin}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
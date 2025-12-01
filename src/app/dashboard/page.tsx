"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from "@/components/header";
import Footer from "@/components/footer";
import Index from "@/components/index/page";

// Login Popup Component - No exit option, must login
function LoginPopup() {
  const handleLogin = () => {
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Login Required
          </h2>
          
          <p className="text-gray-600 mb-6">
            Please log in to continue accessing the dashboard content.
          </p>
          
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    // Check Supabase authentication (works for both email/password and OAuth)
    const checkAuth = async (): Promise<boolean> => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth check error:', error);
          return false;
        }
        
        // If session exists, user is authenticated (works for Google OAuth too)
        return !!session;
      } catch (error) {
        console.error('Error checking auth:', error);
        return false;
      }
    };

    // Run auth check
    checkAuth().then((isAuthenticated: boolean) => {
      // Show popup after 10 seconds ONLY if user is NOT authenticated
      if (!isAuthenticated) {
        timer = setTimeout(() => {
          setShowLoginPopup(true);
        }, 10000); // 10 seconds delay
      }
    });

    // Also listen for auth state changes (when user logs in/out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // User logged in, hide popup
        setShowLoginPopup(false);
        if (timer) clearTimeout(timer);
      } else {
        // User logged out, show popup after delay
        timer = setTimeout(() => {
          setShowLoginPopup(true);
        }, 40000);
      }
    });

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <section>
        <Header />
      </section>
      
      <section className="flex-1">
        <Index />
      </section>
      
      <section>
        <Footer />
      </section>

      {showLoginPopup && <LoginPopup />}
    </div>
  );
}
"use client";
import AdminHeader from "@/components/admin-header";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, Building2, FileText, Loader2 } from "lucide-react";

// Import tab components
import UsersTab from "@/components/admin/UsersTab";
import BusinessTab from "@/components/admin/BusinessTab";
import ReportsTab from "@/components/admin/ReportsTab";

interface AdminUser {
  email: string;
  name: string;
}

type TabId = "users" | "business" | "reports";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("users");
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Authentication check
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          console.log("❌ No session found - redirecting to admin login");
          router.push("/admin/login");
          return;
        }

        const userRole = session.user?.user_metadata?.role;
        const userEmail = session.user?.email;

        console.log("🔍 Checking admin access:");
        console.log("   Role:", userRole);
        console.log("   Email:", userEmail);

        // Check if user is actually an admin
        if (userRole !== "admin" && userEmail !== "admin@tookdeal.com") {
          console.log("❌ Access denied - not an admin");
          await supabase.auth.signOut();
          router.push("/admin/login");
          return;
        }

        console.log("✅ Admin access granted");

        // Load admin user info
        setAdminUser({
          email: session.user.email || "",
          name:
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "Admin",
        });

        setAuthChecking(false);
      } catch (error) {
        console.error("❌ Auth check error:", error);
        router.push("/admin/login");
      }
    };

    checkAdminAuth();
  }, [router]);

  // Show loading while checking authentication
  if (authChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "users" as const,
      label: "Users",
      icon: <Users className="w-5 h-5" />,
      component: <UsersTab />,
    },
    {
      id: "business" as const,
      label: "Business",
      icon: <Building2 className="w-5 h-5" />,
      component: <BusinessTab />,
    },
    {
      id: "reports" as const,
      label: "Reports",
      icon: <FileText className="w-5 h-5" />,
      component: <ReportsTab />,
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader adminUser={adminUser} />

      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto">{currentTab.component}</main>
    </div>
  );
}
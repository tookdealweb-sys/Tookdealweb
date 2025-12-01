// app/admin/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Users,
  LogIn,
  TrendingUp,
  ArrowLeft,
  Activity,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import AdminHeader from "@/components/admin-header";

interface UserLoginStats {
  user_id: string;
  user_email: string;
  total_logins: number;
  last_login: string;
  first_login: string;
}

interface RecentLogin {
  id: string;
  user_email: string;
  login_timestamp: string;
  user_agent: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loginStats, setLoginStats] = useState<UserLoginStats[]>([]);
  const [recentLogins, setRecentLogins] = useState<RecentLogin[]>([]);
  const [totalLogins, setTotalLogins] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const checkAdminAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/admin/login");
        return;
      }

      const userRole = session.user?.user_metadata?.role;
      const userEmail = session.user?.email;

      if (userRole !== "admin" && userEmail !== "admin@tookdeal.com") {
        await supabase.auth.signOut();
        router.push("/admin/login");
        return;
      }

      setAdminUser({
        email: session.user.email || "",
        name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Admin",
      });

      setAuthChecking(false);
    };

    checkAdminAuth();
  }, [router]);

  useEffect(() => {
    if (!authChecking) {
      fetchReportData();
    }
  }, [authChecking]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const { data: statsData, error: statsError } = await supabase
        .from("user_login_stats")
        .select("*")
        .order("total_logins", { ascending: false });

      if (statsError) throw statsError;
      setLoginStats(statsData || []);
      setTotalUsers(statsData?.length || 0);

      const total = statsData?.reduce((sum, user) => sum + user.total_logins, 0) || 0;
      setTotalLogins(total);

      const { data: recentData, error: recentError } = await supabase
        .from("user_login_logs")
        .select("id, user_email, login_timestamp, user_agent")
        .order("login_timestamp", { ascending: false })
        .limit(20);

      if (recentError) throw recentError;
      setRecentLogins(recentData || []);
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBrowser = (userAgent: string) => {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Other";
  };

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader adminUser={adminUser} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Reports</h1>
              <p className="text-gray-600 text-sm mt-0.5">Track user engagement and login activity</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                <Users className="w-7 h-7 text-gray-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Logins</p>
                <p className="text-3xl font-bold text-gray-900">{totalLogins}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                <LogIn className="w-7 h-7 text-gray-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Avg per User</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalUsers > 0 ? (totalLogins / totalUsers).toFixed(1) : "0"}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                <TrendingUp className="w-7 h-7 text-gray-700" />
              </div>
            </div>
          </div>
        </div>

        {/* User Login Statistics Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Login Statistics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total Logins
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    First Login
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loginStats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No login data available</p>
                    </td>
                  </tr>
                ) : (
                  loginStats.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.user_email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-gray-100 text-gray-900">
                          {user.total_logins}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(user.first_login)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(user.last_login)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Login Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Login Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Login Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Browser
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentLogins.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No recent login activity</p>
                    </td>
                  </tr>
                ) : (
                  recentLogins.map((login) => (
                    <tr key={login.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {login.user_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(login.login_timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getBrowser(login.user_agent)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
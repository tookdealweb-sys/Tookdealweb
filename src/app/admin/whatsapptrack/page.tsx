// app/admin/whatsapptrack/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, RefreshCw, ArrowLeft, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import AdminHeader from "@/components/admin-header";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface WhatsAppClick {
  id: string;
  business_id: string;
  business_name: string;
  user_id: string | null;
  clicked_at: string;
  ip_address: string;
  user_agent: string;
}

interface AdminUser {
  id: string;
  email: string;
  role?: string;
}

export default function WhatsAppTrackPage() {
  const router = useRouter();
  const [clicks, setClicks] = useState<WhatsAppClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const fetchClicks = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/whatsapp-clicks');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch clicks');
      }

      setClicks(result.data || []);
    } catch (err) {
      console.error("Error fetching WhatsApp clicks:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setAuthChecking(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/admin/login');
        return;
      }

      const isAdmin = user.user_metadata?.role === 'admin' || user.email?.includes('admin');
      
      if (!isAdmin) {
        router.push('/admin/login');
        return;
      }

      setAdminUser({
        id: user.id,
        email: user.email || '',
        role: user.user_metadata?.role || 'admin'
      });
      setIsAuthenticated(true);
      fetchClicks();
    } catch (err) {
      console.error("Error checking authentication:", err);
      router.push('/admin/login');
    } finally {
      setAuthChecking(false);
    }
  };

  const filteredClicks = clicks.filter((click) => {
    const matchesSearch = click.business_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (dateFilter === "all") return true;

    const clickDate = new Date(click.clicked_at);
    const now = new Date();

    switch (dateFilter) {
      case "today":
        return clickDate.toDateString() === now.toDateString();
      case "week":
        return clickDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "month":
        return clickDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  });

  const stats = {
    total: filteredClicks.length,
    today: clicks.filter(c => new Date(c.clicked_at).toDateString() === new Date().toDateString()).length,
    thisWeek: clicks.filter(c => new Date(c.clicked_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    thisMonth: clicks.filter(c => new Date(c.clicked_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
  };

  const businessStats = filteredClicks.reduce((acc, click) => {
    if (!acc[click.business_name]) acc[click.business_name] = 0;
    acc[click.business_name]++;
    return acc;
  }, {} as Record<string, number>);

  const topBusinesses = Object.entries(businessStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const getBrowser = (userAgent: string) => {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Other";
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminHeader adminUser={adminUser} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-gray-700 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Loading tracking data...</p>
          </div>
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
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <FaWhatsapp className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp Tracking</h1>
                <p className="text-gray-600 text-sm mt-0.5">Monitor business engagement metrics</p>
              </div>
            </div>
            <button
              onClick={fetchClicks}
              disabled={refreshing}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-gray-600 text-sm font-medium mb-1">Total Clicks</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-gray-600 text-sm font-medium mb-1">Today</p>
            <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-gray-600 text-sm font-medium mb-1">This Week</p>
            <p className="text-3xl font-bold text-gray-900">{stats.thisWeek}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-gray-600 text-sm font-medium mb-1">This Month</p>
            <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
          </div>
        </div>

        {/* Top Businesses */}
        {topBusinesses.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Businesses</h2>
            <div className="space-y-3">
              {topBusinesses.map(([name, count], index) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{name}</span>
                  </div>
                  <span className="text-gray-700 font-semibold">{count} clicks</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all font-medium"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Clicks Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Browser
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClicks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No clicks found</p>
                    </td>
                  </tr>
                ) : (
                  filteredClicks.map((click) => (
                    <tr key={click.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FaWhatsapp className="text-green-600 text-lg flex-shrink-0" />
                          <span className="font-medium text-gray-900">{click.business_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {new Date(click.clicked_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(click.clicked_at).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {click.ip_address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getBrowser(click.user_agent)}
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
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  Loader2,
  LucideIcon,
  Shirt,
  Footprints,
  Sparkles,
  Gift,
  Home,
  Car,
  Zap,
  Smartphone,
  Trophy,
  Scissors,
  Baby,
  Heart,
  Snowflake,
  Briefcase,
  Plane,
  Wrench,
  ShoppingCart,
  Package,
  Pill,
  Leaf,
} from "lucide-react";
import { useBusinessData } from "@/hooks/useBusinessData";
import { Business } from "@/types/business";

interface Category {
  key: string;
  label: string;
  icon: LucideIcon;
}

const categoryIcons: Category[] = [
  { key: "clothes", label: "Clothes", icon: Shirt },
  { key: "footwear", label: "Footwear", icon: Footprints },
  { key: "ladiesFancy", label: "Ladies Fancy", icon: Sparkles },
  { key: "toysGifts", label: "Toys & Gifts", icon: Gift },
  { key: "homeDecor", label: "Home Decor", icon: Home },
  { key: "carBikeAccessories", label: "Car & Bike", icon: Car },
  { key: "electrical", label: "Electrical & Electronics", icon: Zap },
  { key: "gadgetAccessories", label: "Gadget Accessories", icon: Smartphone },
  { key: "sportsGoods", label: "Sports Goods", icon: Trophy },
  { key: "fashion", label: "Fashion", icon: Scissors },
  { key: "kidsEssentials", label: "Kids Essentials", icon: Baby },
  { key: "personalCare", label: "Personal Care", icon: Heart },
  { key: "seasonalItems", label: "Seasonal Items", icon: Snowflake },
  { key: "officeSupply", label: "Office Supply", icon: Briefcase },
  { key: "travelAccessories", label: "Travel Accessories", icon: Plane },
  { key: "tools", label: "Tools", icon: Wrench },
  { key: "pharmaSurgicals", label: "Pharma & Surgicals", icon: Pill },
  { key: "plantsNursery", label: "Plants & Nursery", icon: Leaf },
];

export default function BusinessDirectory() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const router = useRouter();

  // Fetch data from Supabase
  const { businesses: businessData, loading, error } = useBusinessData();

  // Get all unique categories from database
  const databaseCategories = useMemo(() => {
    if (!businessData) return [];
    const uniqueCategories = [...new Set(businessData.map((b) => b.category))];
    return uniqueCategories.filter(Boolean).sort();
  }, [businessData]);

  // Filter and sort businesses
  const filteredBusinesses = useMemo(() => {
    if (!businessData) return [];

    let filtered: Business[] = [...businessData];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (business) =>
          business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.services?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (business) => business.category === selectedCategory,
      );
    }

    return filtered;
  }, [businessData, searchTerm, selectedCategory]);

  // Group businesses by category
  const businessesByCategory = useMemo(() => {
    if (!businessData) return {};

    const grouped: Record<string, Business[]> = {};

    // Initialize static categories with empty arrays
    categoryIcons.forEach((cat) => {
      grouped[cat.key] = [];
    });

    // Populate with actual businesses
    businessData.forEach((business) => {
      if (!grouped[business.category]) {
        grouped[business.category] = [];
      }
      grouped[business.category].push(business);
    });

    return grouped;
  }, [businessData]);

  const BusinessCard = ({ business }: { business: Business }) => (
    <div
      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:shadow-[#00d4ad]/20 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
      onClick={() => router.push(`/business/${business.id}`)}
    >
      <div className="aspect-video bg-gray-200 dark:bg-zinc-800 relative overflow-hidden">
        <img
          src={
            business.image ||
            `https://via.placeholder.com/300x200/e5e7eb/9ca3af?text=${encodeURIComponent(
              business.name,
            )}`
          }
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/300x200/e5e7eb/9ca3af?text=${encodeURIComponent(
              business.name,
            )}`;
          }}
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-full p-2 border border-[#00d4ad]">
            <ExternalLink className="w-4 h-4 text-[#00d4ad]" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-1 group-hover:text-[#00d4ad] transition-colors duration-200 break-words">
          {business.name}
        </h3>
        {business.category && (
          <div className="mb-2">
            <span className="inline-block px-2 py-1 bg-[#00d4ad]/10 dark:bg-[#00d4ad]/20 text-[#00d4ad] text-xs font-medium rounded border border-[#00d4ad]/30">
              {business.category}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1 text-slate-600 dark:text-zinc-400 mt-1">
          <MapPin className="w-3 h-3 text-slate-500 dark:text-zinc-500 flex-shrink-0" />
          <span className="text-xs truncate">
            {business.location?.split(",")[0]}
          </span>
        </div>
        {business.isopen !== undefined && (
          <div className="mt-2">
            <span
              className={`text-xs font-medium ${
                business.isopen
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {business.isopen ? "• Open" : "• Closed"}
            </span>
          </div>
        )}
        <div className="mt-2 text-xs text-[#00d4ad] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          View Details →
        </div>
      </div>
    </div>
  );

  const SectionCarousel = ({
    title,
    businesses,
  }: {
    title: string;
    businesses: Business[];
  }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const itemsPerPage = 4;
    const maxIndex = Math.max(
      0,
      Math.ceil(businesses.length / itemsPerPage) - 1,
    );

    const visibleBusinesses = businesses.slice(
      currentIndex * itemsPerPage,
      (currentIndex + 1) * itemsPerPage,
    );

    const nextSlide = () => {
      setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    };

    const prevSlide = () => {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    };

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
            {title}
          </h2>
          {businesses.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-[#00d4ad] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent dark:border-zinc-700"
                disabled={businesses.length <= itemsPerPage}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-[#00d4ad] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent dark:border-zinc-700"
                disabled={businesses.length <= itemsPerPage}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        {businesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {visibleBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-zinc-900 border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-lg p-8 text-center">
            <p className="text-slate-500 dark:text-zinc-400">
              No businesses in this category yet
            </p>
            <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1">
              Check back soon!
            </p>
          </div>
        )}
      </div>
    );
  };

  // Get icon for category or use default
  const getCategoryIcon = (categoryKey: string): LucideIcon => {
    const iconCat = categoryIcons.find((c) => c.key === categoryKey);
    return iconCat ? iconCat.icon : Package;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#00d4ad] mx-auto mb-4" />
          <p className="text-slate-600 dark:text-zinc-300 text-lg">
            Loading businesses...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              Error Loading Data
            </p>
            <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden mt-18">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-950 shadow-sm border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search Bar + Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-3 mb-6">
            <div className="flex-1 flex gap-2 w-full">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search for business..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg focus:ring-2 focus:ring-[#00d4ad] text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#00d4ad] text-white rounded-lg hover:bg-[#00b89a] transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>

          {/* Category Icons - Same design for ALL screen sizes */}
          <div className="mb-4">
            {/* Mobile & Desktop: Grid Layout with Card Style */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* All Categories Button */}
              <button
                onClick={() => setSelectedCategory("all")}
                className={`relative overflow-hidden rounded-2xl min-h-[90px] flex items-center transition-all duration-200 ${
                  selectedCategory === "all"
                    ? "bg-[#00d4ad]"
                    : "bg-zinc-800/80 hover:bg-zinc-700/80"
                }`}
              >
                <div className={`w-[90px] h-full flex items-center justify-center flex-shrink-0 ${
                  selectedCategory === "all" ? "bg-[#00b89a]" : "bg-zinc-900/50"
                }`}>
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 px-3 flex items-center justify-center">
                  <span className="text-base font-bold text-white">All</span>
                </div>
              </button>

              {/* Category Buttons */}
              {categoryIcons.map((category) => {
                const IconComponent = category.icon;
                const businessCount = businessesByCategory[category.key]?.length || 0;
                const isActive = selectedCategory === category.key;
                const isEmpty = businessCount === 0;

                // Generate background colors based on category
                const colors = [
                  { main: "#10b981", icon: "#059669" }, // green
                  { main: "#8b5cf6", icon: "#7c3aed" }, // purple
                  { main: "#06b6d4", icon: "#0891b2" }, // cyan
                  { main: "#f59e0b", icon: "#d97706" }, // amber
                  { main: "#ec4899", icon: "#db2777" }, // pink
                  { main: "#3b82f6", icon: "#2563eb" }, // blue
                  { main: "#ef4444", icon: "#dc2626" }, // red
                  { main: "#14b8a6", icon: "#0d9488" }, // teal
                ];
                const colorIndex = categoryIcons.findIndex(c => c.key === category.key) % colors.length;
                const color = isEmpty ? { main: "#3f3f46", icon: "#27272a" } : colors[colorIndex];

                return (
                  <button
                    key={category.key}
                    onClick={() => !isEmpty && setSelectedCategory(category.key)}
                    disabled={isEmpty}
                    className={`relative overflow-hidden rounded-2xl min-h-[90px] flex items-center transition-all duration-200 ${
                      isEmpty ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                    }`}
                    style={{ backgroundColor: isActive ? "#00d4ad" : color.main }}
                  >
                    <div 
                      className="w-[90px] h-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: isActive ? "#00b89a" : color.icon }}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 px-3 flex items-center justify-center">
                      <span className="text-sm font-bold text-white leading-tight text-center">
                        {category.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg focus:ring-2 focus:ring-[#00d4ad] text-slate-700 dark:text-white w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            {databaseCategories.map((cat) => {
              return (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              );
            })}
          </select>

          {/* Advanced Filters Button */}
          <button
            onClick={() => router.push("/search")}
            className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Advanced Filters</span>
          </button>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className="mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-6 break-words">
              Search Results for "
              <span className="text-[#00d4ad]">{searchTerm}</span>"
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredBusinesses.slice(0, 8).map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
            {filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-zinc-400 text-lg">
                  No businesses found matching your search.
                </p>
                <p className="text-slate-400 dark:text-zinc-500 text-sm mt-2">
                  Try different keywords or check your spelling.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Business Sections - Show ALL categories */}
        {!searchTerm && selectedCategory === "all" && (
          <>
            {databaseCategories.map((category) => {
              const businesses = businessesByCategory[category] || [];

              return (
                <SectionCarousel
                  key={category}
                  title={category}
                  businesses={businesses}
                />
              );
            })}
          </>
        )}

        {/* All Results when filtering */}
        {selectedCategory !== "all" && !searchTerm && (
          <div className="mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-6">
              Filtered Results
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
            {filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-zinc-400 text-lg">
                  No businesses found matching your filters.
                </p>
                <p className="text-slate-400 dark:text-zinc-500 text-sm mt-2">
                  Try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
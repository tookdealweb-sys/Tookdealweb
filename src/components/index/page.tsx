"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Utensils,
  Building2,
  Smartphone,
  ShoppingCart,
  Sparkles,
  Car,
  Stethoscope,
  BookOpen,
  Gem,
  Waves,
  ExternalLink,
  Wrench,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { useBusinessData } from "@/hooks/useBusinessData";
import { Business } from "@/types/business";

interface Category {
  key: string;
  label: string;
  icon: LucideIcon;
}

const categories: Category[] = [
  { key: "restaurants", label: "Restaurants", icon: Utensils },
  { key: "homeServices", label: "Home Services", icon: Wrench },
  { key: "babyKids", label: "Baby & Kids", icon: ShoppingCart },
  { key: "techMobile", label: "Tech & Mobile", icon: Smartphone },
  { key: "car", label: "Auto Services", icon: Car },
  { key: "hospitals", label: "Hospitals", icon: Building2 },
  { key: "beauty", label: "Beauty & Wellness", icon: Sparkles },
  { key: "clinics", label: "Clinics", icon: Stethoscope },
  { key: "bookstores", label: "Bookstores", icon: BookOpen },
  { key: "luxe", label: "Luxe", icon: Gem },
  { key: "beach", label: "Beach", icon: Waves },
];

export default function BusinessDirectory() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");

  const router = useRouter();

  // Fetch data from Supabase
  const { businesses: businessData, loading, error } = useBusinessData();

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
          business.services?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (business) => business.category === selectedCategory
      );
    }

    // Filter by location
    if (location !== "all") {
      filtered = filtered.filter((business) =>
        business.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Sort by rating
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return filtered;
  }, [businessData, searchTerm, selectedCategory, location]);

  // Group businesses by category for section carousels
  const businessesByCategory = useMemo(() => {
    if (!businessData) return {};

    const grouped: Record<string, Business[]> = {};
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
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
      onClick={() => router.push(`/business/${business.id}`)}
    >
      <div className="aspect-video bg-gray-200 relative overflow-hidden">
        <img
          src={
            business.image ||
            `https://via.placeholder.com/300x200/e5e7eb/9ca3af?text=${encodeURIComponent(
              business.name
            )}`
          }
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/300x200/e5e7eb/9ca3af?text=${encodeURIComponent(
              business.name
            )}`;
          }}
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
            <ExternalLink className="w-4 h-4 text-[#00d4ad]-600" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-[#00d4ad]-600 transition-colors duration-200 break-words">
          {business.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-slate-700">
              {business.rating}
            </span>
            <span className="text-xs text-slate-500">({business.reviews})</span>
          </div>
          {business.isopen !== undefined && (
            <span
              className={`text-xs font-medium ${
                business.isopen ? "text-green-600" : "text-red-600"
              }`}
            >
              {business.isopen ? "Open" : "Closed"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-600 mt-1">
          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
          <span className="text-xs truncate">
            {business.location?.split(",")[0]}
          </span>
        </div>
        <div className="mt-2 text-xs text-[#00d4ad]-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
      Math.ceil(businesses.length / itemsPerPage) - 1
    );

    const visibleBusinesses = businesses.slice(
      currentIndex * itemsPerPage,
      (currentIndex + 1) * itemsPerPage
    );

    const nextSlide = () => {
      setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    };

    const prevSlide = () => {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    };

    if (businesses.length === 0) return null;

    return (
      <div className="mb-12 ">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            {title}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-slate-100 hover:bg-[#00d4ad] hover:text-[#00d4ad]-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={businesses.length <= itemsPerPage}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-slate-100 hover:bg-[#00d4ad] hover:text-[#00d4ad]-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={businesses.length <= itemsPerPage}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {visibleBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      </div>
    );
  };

  // Get unique categories that have businesses
  const availableCategories = useMemo(() => {
    if (!businessData) return [];
    const cats = [...new Set(businessData.map((b) => b.category))];
    return cats.filter((cat) => businessesByCategory[cat]?.length > 0);
  }, [businessData, businessesByCategory]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#00d4ad]-600 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading businesses...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center overflow-x-hidden">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-semibold mb-2">
              Error Loading Data
            </p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden mt-18">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search Bar + Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-3 mb-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchTerm.trim()) {
                  router.push(
                    `/search?query=${encodeURIComponent(searchTerm)}`
                  );
                }
              }}
              className="flex-1 flex gap-2 w-full"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for business..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2  text-slate-700 placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#00d4ad] text-white rounded-lg hover:bg-[#3d887a] transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>
          </div>

          {/* Category Icons - Hidden on mobile, visible on md and up */}
          <div className="hidden md:block overflow-x-auto overflow-y-hidden -mx-4 px-4">
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            <div className="flex items-center gap-2 pb-2 scrollbar-hide min-w-min">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex flex-col items-center min-w-[5rem] p-3 rounded-lg transition-all duration-200 flex-shrink-0 ${
                  selectedCategory === "all"
                    ? "bg-[#00d4ad] text-[#00d4ad]-600"
                    : "text-slate-600 hover:bg-[#00d4ad] hover:text-[#00d4ad]-600"
                }`}
              >
                <ShoppingCart className="w-6 h-6 mb-2" />
                <span className="text-xs font-medium text-center whitespace-nowrap">
                  All
                </span>
              </button>

              {categories.map((category) => {
                const IconComponent = category.icon;
                const hasBusinesses =
                  businessesByCategory[category.key]?.length > 0;
                if (!hasBusinesses) return null;

                return (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`flex flex-col items-center min-w-[5rem] p-3 rounded-lg transition-all duration-200 flex-shrink-0 ${
                      selectedCategory === category.key
                        ? "bg-[#00d4ad] text-[#00d4ad]-600"
                        : "text-slate-600 hover:bg-[#00d4ad] hover:text-[#00d4ad]-600"
                    }`}
                  >
                    <IconComponent className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium text-center whitespace-nowrap">
                      {category.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 ">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00d4ad]-500 text-slate-700 bg-white w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            {availableCategories.map((cat) => {
              const categoryLabel =
                categories.find((c) => c.key === cat)?.label || cat;
              return (
                <option key={cat} value={cat}>
                  {categoryLabel}
                </option>
              );
            })}
          </select>

          {/* Advanced Filters Button */}
          <button
            onClick={() => router.push('/search')}
            className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Advanced Filters</span>
          </button>

          <div className="text-sm text-slate-600 font-medium sm:ml-auto text-center sm:text-left">
            {filteredBusinesses.length} businesses found
          </div>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className="mb-12 ">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 break-words">
              Search Results for "
              <span className="text-[#00d4ad]-600">{searchTerm}</span>"
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredBusinesses.slice(0, 8).map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
            {filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">
                  No businesses found matching your search.
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Try different keywords or check your spelling.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Business Sections */}
        {!searchTerm && selectedCategory === "all" && (
          <>
            {businessesByCategory.restaurants && (
              <SectionCarousel
                title="Popular Restaurants"
                businesses={businessesByCategory.restaurants}
              />
            )}

            {businessesByCategory.homeServices && (
              <SectionCarousel
                title="Trusted Home Services"
                businesses={businessesByCategory.homeServices}
              />
            )}

            {businessesByCategory.babyKids && (
              <SectionCarousel
                title="Baby & Kids Essentials"
                businesses={businessesByCategory.babyKids}
              />
            )}

            {businessesByCategory.techMobile && (
              <SectionCarousel
                title="Top Tech & Mobile Stores"
                businesses={businessesByCategory.techMobile}
              />
            )}

            {businessesByCategory.car && (
              <SectionCarousel
                title="Auto Services"
                businesses={businessesByCategory.car}
              />
            )}
          </>
        )}

        {/* All Results when filtering */}
        {selectedCategory !== "all" && !searchTerm && (
            <div className="mb-12">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">
                Filtered Results
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
              {filteredBusinesses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-lg">
                    No businesses found matching your filters.
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
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
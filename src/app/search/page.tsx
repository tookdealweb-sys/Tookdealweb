"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { Star, MapPin, Clock, Phone, Heart, MessageCircle, Filter, X, Search, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchHeader from "@/components/header";
import Footer from "@/components/footer";
import { supabase } from '@/lib/supabaseClient';

const PAGE_SIZE = 6;

interface Business {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  contact: string;
  openhours: string;
  services: string;
  image: string;
  images: string[];
  category: string;
  businesstype: string;
  distance: string;
  pricerange: string;
  isopen: boolean;
  email: string;
  description: string;
  website: string;
  latitude?: number;
  longitude?: number;
}

interface Filters {
  category: string[];
  sorting: string[];
  rating: string[];
  pricerange: string[];
  openNow: string[];
}

// Available categories
const categories = [
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'homeServices', label: 'Home Services' },
  { value: 'babyKids', label: 'Baby & Kids' },
  { value: 'techMobile', label: 'Tech & Mobile' },
  { value: 'car', label: 'Auto Services' },
  { value: 'hospitals', label: 'Hospitals' },
  { value: 'beauty', label: 'Beauty & Wellness' },
  { value: 'clinics', label: 'Clinics' },
  { value: 'bookstores', label: 'Bookstores' },
  { value: 'luxe', label: 'Luxe' },
  { value: 'beach', label: 'Beach' },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    category: [],
    sorting: ["highestRated"],
    rating: [],
    pricerange: [],
    openNow: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [whatsappTracking, setWhatsappTracking] = useState<{ [key: string]: boolean }>({});

  // Fetch businesses from Supabase
  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .order('rating', { ascending: false });

      if (fetchError) throw fetchError;

      setBusinesses(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  // Get search query from URL params
  useEffect(() => {
    const query = searchParams.get('query') || searchParams.get('q') || '';
    setSearchQuery(query);
    setLocalSearchQuery(query);
    setCurrentPage(1);
  }, [searchParams]);

  // Handle business card click
  const handleBusinessClick = (business: Business) => {
    router.push(`/business/${business.id}`);
  };

  // Handle local search
  const handleLocalSearch = () => {
    setSearchQuery(localSearchQuery);
    setCurrentPage(1);
  };

  // Handle WhatsApp click with tracking
  const handleWhatsAppClick = async (e: React.MouseEvent, business: Business) => {
    if (!business || whatsappTracking[business.id]) return;
    
    setWhatsappTracking(prev => ({ ...prev, [business.id]: true }));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch('/api/admin/track-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          businessId: business.id,
          businessName: business.name,
        }),
      });
      
      if (response.ok) {
        console.log('✅ WhatsApp click tracked');
      }
    } catch (error) {
      console.error('❌ Error tracking WhatsApp click:', error);
    } finally {
      setWhatsappTracking(prev => ({ ...prev, [business.id]: false }));
      
      const phone = business.contact.replace(/[^0-9+]/g, '');
      window.open(`https://wa.me/${phone.startsWith('+') ? phone : '+91' + phone}`, '_blank');
    }
  };

  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    let filtered = businesses;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(business =>
        business.name?.toLowerCase().includes(query) ||
        business.services?.toLowerCase().includes(query) ||
        business.location?.toLowerCase().includes(query) ||
        business.category?.toLowerCase().includes(query) ||
        business.businesstype?.toLowerCase().includes(query) ||
        business.description?.toLowerCase().includes(query)
      );
    }

    filtered = filtered.filter((business) => {
      if (filters.category.length > 0) {
        if (!filters.category.includes(business.category)) return false;
      }

      if (filters.rating.length > 0) {
        if (filters.rating.includes("4up") && business.rating < 4) return false;
        if (filters.rating.includes("3up") && business.rating < 3) return false;
      }

      if (filters.pricerange.length > 0) {
        if (!filters.pricerange.includes(business.pricerange)) return false;
      }

      if (filters.openNow.includes("showOnlyOpen")) {
        if (!business.isopen) return false;
      }

      return true;
    });

    return filtered;
  }, [businesses, searchQuery, filters]);

  // Sort businesses
  const sortedBusinesses = useMemo(() => {
    const sorted = [...filteredBusinesses];
    
    if (filters.sorting.includes("highestRated")) {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (filters.sorting.includes("mostReviewed")) {
      sorted.sort((a, b) => b.reviews - a.reviews);
    } else if (filters.sorting.includes("alphabetical")) {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return sorted;
  }, [filteredBusinesses, filters.sorting]);

  const totalPages = Math.ceil(sortedBusinesses.length / PAGE_SIZE);
  const currentBusinesses = sortedBusinesses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleFilterChange = (filterType: keyof Filters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      category: [],
      sorting: ["highestRated"],
      rating: [],
      pricerange: [],
      openNow: []
    });
    setCurrentPage(1);
  };

  const FilterSection = ({ title, children, defaultOpen = true }: any) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
        >
          {title}
          <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {isOpen && <div className="space-y-2">{children}</div>}
      </div>
    );
  };

  const CheckboxFilter = ({ filterType, value, label, checked }: any) => (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => handleFilterChange(filterType, value, e.target.checked)}
        className="w-4 h-4 text-[#00d4ad] border-gray-300 rounded focus:ring-[#00d4ad]"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  const FilterSidebar = () => (
    <div className="bg-white rounded-lg shadow p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">Filter</h2>
        <div className="flex items-center gap-2">
          <button onClick={resetFilters} className="text-[#00d4ad] text-sm hover:underline">
            Reset
          </button>
          <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden text-gray-600 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>
      </div>

      <FilterSection title="Category">
        {categories.map(cat => (
          <CheckboxFilter key={cat.value} filterType="category" value={cat.value} label={cat.label} checked={filters.category.includes(cat.value)} />
        ))}
      </FilterSection>

      <FilterSection title="Sorting Options">
        <CheckboxFilter filterType="sorting" value="highestRated" label="Highest Rated" checked={filters.sorting.includes("highestRated")} />
        <CheckboxFilter filterType="sorting" value="mostReviewed" label="Most Reviewed" checked={filters.sorting.includes("mostReviewed")} />
        <CheckboxFilter filterType="sorting" value="alphabetical" label="Alphabetical" checked={filters.sorting.includes("alphabetical")} />
      </FilterSection>

      <FilterSection title="Ratings">
        <CheckboxFilter filterType="rating" value="4up" label="⭐⭐⭐⭐ & Up" checked={filters.rating.includes("4up")} />
        <CheckboxFilter filterType="rating" value="3up" label="⭐⭐⭐ & Up" checked={filters.rating.includes("3up")} />
      </FilterSection>

      <FilterSection title="Price Range">
        <CheckboxFilter filterType="pricerange" value="$" label="$ - Budget" checked={filters.pricerange.includes("$")} />
        <CheckboxFilter filterType="pricerange" value="$$" label="$$ - Moderate" checked={filters.pricerange.includes("$$")} />
        <CheckboxFilter filterType="pricerange" value="$$$" label="$$$ - Expensive" checked={filters.pricerange.includes("$$$")} />
        <CheckboxFilter filterType="pricerange" value="$$$$" label="$$$$ - Luxury" checked={filters.pricerange.includes("$$$$")} />
      </FilterSection>

      <FilterSection title="Open Now">
        <CheckboxFilter filterType="openNow" value="showOnlyOpen" label="Show only open businesses" checked={filters.openNow.includes("showOnlyOpen")} />
      </FilterSection>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SearchHeader/>
        <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
          <div className="flex flex-col justify-center items-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#00d4ad] mb-4" />
            <p className="text-gray-700 font-medium">Loading businesses...</p>
          </div>
        </div>
        <Footer/>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SearchHeader/>
        <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold">Error loading businesses</p>
            <p className="text-red-600 mt-2">{error}</p>
            <button onClick={fetchBusinesses} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Try Again
            </button>
          </div>
        </div>
        <Footer/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchHeader/>
      
      <div className="bg-white shadow-sm border-b pt-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="text-sm text-gray-600 mb-2">
            Search Results / &quot;{searchQuery}&quot; / {sortedBusinesses.length} Results Found
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            Search Results for &quot;{searchQuery}&quot;
          </h1>
          
          <div className="mb-4">
            <div className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLocalSearch()}
                placeholder="Search businesses, services, locations..."
                className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d4ad] focus:border-[#00d4ad] text-sm"
              />
              <button
                onClick={handleLocalSearch}
                className="absolute inset-y-0 right-0 px-4 py-2 m-1 bg-[#00d4ad] text-white rounded-md hover:bg-[#00d4ad] transition-colors text-sm font-medium"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden fixed bottom-6 left-6 z-40 bg-[#00d4ad] text-white p-4 rounded-full shadow-lg hover:bg-[#00d4ad] transition-colors flex items-center gap-2"
        >
          <Filter size={20} />
          <span className="font-medium">Filters</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20">
              <FilterSidebar />
            </div>
          </div>

          <div
            className={`lg:hidden fixed inset-0 z-50 transition-transform duration-300 ${
              isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div
              className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                isMobileFilterOpen ? 'opacity-50' : 'opacity-0'
              }`}
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto">
              <FilterSidebar />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="bg-[#00d4ad]border border-[#00d4ad] rounded-lg p-4">
                <p className="text-sm md:text-base text-[#00d4ad]">
                  <strong>Search Results for:</strong> &quot;{searchQuery}&quot; 
                  <span className="ml-2 text-[#00d4ad] block md:inline mt-1 md:mt-0">
                    Showing {currentBusinesses.length} of {sortedBusinesses.length} businesses
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {currentBusinesses.map((business) => (
                <div 
                  key={business.id} 
                  className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleBusinessClick(business)}
                >
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={business.image || `https://via.placeholder.com/128x96/e5e7eb/9ca3af?text=${encodeURIComponent(business.name.charAt(0))}`}
                        alt={business.name}
                        className="w-full md:w-32 h-48 md:h-24 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/128x96/e5e7eb/9ca3af?text=${encodeURIComponent(business.name.charAt(0))}`;
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-[#00d4ad] transition-colors">
                        {business.name}
                      </h3>
                      
                      {business.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin size={14} />
                          <span>{business.location}</span>
                        </div>
                      )}
                      
                      {business.services && (
                        <div className="text-sm text-gray-600">
                          Services: {business.services}
                        </div>
                      )}
                      
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm">
                        {business.openhours && (
                          <div className="flex items-center gap-1">
                            <Clock size={14} className={business.isopen ? "text-[#00d4ad]" : "text-red-600"} />
                            <span className={business.isopen ? "text-[#00d4ad]" : "text-red-600"}>
                              {business.isopen ? "Open" : "Closed"} - {business.isopen}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-current" />
                          <span className="font-medium">{business.rating}</span>
                          <span className="text-gray-500">({business.reviews})</span>
                        </div>
                        {business.pricerange && (
                          <span className="text-gray-600">{business.pricerange}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col justify-between md:justify-between items-center md:items-end gap-2">
                      {business.contact && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsAppClick(e, business);
                          }}
                          disabled={whatsappTracking[business.id]}
                          className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-[#00d4ad] text-white rounded-md hover:bg-[#00d4ad] transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MessageCircle size={18} />
                          {whatsappTracking[business.id] ? 'Tracking...' : 'WhatsApp'}
                        </button>
                      )}
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
                      >
                        <Heart size={14} />
                        Favourite
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {currentBusinesses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No businesses found for &quot;{searchQuery}&quot;.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try different keywords or adjust your filters.
                </p>
                <button 
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-[#00d4ad] text-white rounded hover:bg-[#00d4ad]"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 md:gap-2 mt-6 flex-wrap">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 md:px-3 py-2 text-sm md:text-base text-[#00d4ad] hover:bg-[#00d4ad]disabled:text-gray-400"
                >
                  « Prev
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-2 md:px-3 py-2 text-sm md:text-base rounded ${
                      currentPage === i + 1
                        ? "bg-[#00d4ad] text-white"
                        : "text-[#00d4ad] hover:bg-[#00d4ad]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 md:px-3 py-2 text-sm md:text-base text-[#00d4ad] hover:bg-[#00d4ad]disabled:text-gray-400"
                >
                  Next »
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default function DynamicSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <SearchHeader/>
        <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4ad]"></div>
            <span className="ml-3 text-gray-600">Loading search...</span>
          </div>
        </div>
        <Footer/>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
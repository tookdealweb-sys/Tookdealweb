"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { Star, MapPin, Clock, Phone, Heart, MessageCircle, Filter, X, Search, Navigation, Loader2 } from "lucide-react";
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
  calculatedDistance?: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface Filters {
  category: string[];
  sorting: string[];
  rating: string[];
  pricerange: string[];
  openNow: string[];
  distanceRange: string[];
  nearMe: string[];
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface CheckboxFilterProps {
  filterType: keyof Filters;
  value: string;
  label: string;
  checked: boolean;
}

// Available categories from add business page
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

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

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
    openNow: [],
    distanceRange: [],
    nearMe: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [whatsappTracking, setWhatsappTracking] = useState<{ [key: string]: boolean }>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

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
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location
  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
        // Enable "Near Me" filter when location is obtained
        setFilters(prev => ({
          ...prev,
          nearMe: ["enabled"]
        }));
      },
      (err) => {
        let errorMessage = "Unable to retrieve your location";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Please allow location access in your browser settings";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case err.TIMEOUT:
            errorMessage = "Location request timed out. Please try again";
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  };

  // Calculate distances for all businesses
  const businessesWithDistance = useMemo(() => {
    if (!businesses) return [];

    if (!userLocation) {
      return businesses.map(business => ({
        ...business,
        calculatedDistance: undefined,
      }));
    }

    console.log('📍 User Location:', userLocation);

    return businesses.map((business) => {
      let businessLat: number | null = null;
      let businessLon: number | null = null;

      // Pattern 1: "lat:12.34, lon:56.78"
      const pattern1 = business.location?.match(/lat:([\d.-]+).*?lon:([\d.-]+)/i);
      if (pattern1) {
        businessLat = parseFloat(pattern1[1]);
        businessLon = parseFloat(pattern1[2]);
        console.log(`✅ Pattern 1 matched for ${business.name}:`, businessLat, businessLon);
      }

      // Pattern 2: "12.34, 56.78" (just coordinates at the end)
      if (!businessLat && business.location) {
        const coords = business.location.split(',').map(s => s.trim());
        if (coords.length >= 2) {
          const lat = parseFloat(coords[coords.length - 2]);
          const lon = parseFloat(coords[coords.length - 1]);
          if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            businessLat = lat;
            businessLon = lon;
            console.log(`✅ Pattern 2 matched for ${business.name}:`, businessLat, businessLon);
          }
        }
      }

      // Check if business has separate latitude/longitude fields
      if (!businessLat && (business as any).latitude) {
        businessLat = parseFloat((business as any).latitude);
        console.log(`✅ Latitude field for ${business.name}:`, businessLat);
      }
      if (!businessLon && (business as any).longitude) {
        businessLon = parseFloat((business as any).longitude);
        console.log(`✅ Longitude field for ${business.name}:`, businessLon);
      }

      if (businessLat && businessLon && !isNaN(businessLat) && !isNaN(businessLon)) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          businessLat,
          businessLon
        );
        console.log(`📏 Distance for ${business.name}: ${distance.toFixed(2)}km`);
        return {
          ...business,
          calculatedDistance: distance,
        };
      }
      
      console.log(`❌ No coordinates found for ${business.name}`);
      return {
        ...business,
        calculatedDistance: 999999,
      };
    });
  }, [businesses, userLocation]);

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
  const handleLocalSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ WhatsApp click tracked:', result);
      } else {
        console.error('❌ Failed to track WhatsApp click:', result);
      }
    } catch (error) {
      console.error('❌ Error tracking WhatsApp click:', error);
    } finally {
      setWhatsappTracking(prev => ({ ...prev, [business.id]: false }));
      
      const phone = business.contact.replace(/[^0-9+]/g, '');
      window.open(`https://wa.me/${phone.startsWith('+') ? phone : '+91' + phone}`, '_blank');
    }
  };

  // Filter businesses based on search query
  const filteredBusinesses = useMemo(() => {
    let filtered = businessesWithDistance;

    // Search across all fields
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

    // Apply filters
    filtered = filtered.filter((business) => {
      // Category filter
      if (filters.category.length > 0) {
        if (!filters.category.includes(business.category)) return false;
      }

      // Rating filter
      if (filters.rating.length > 0) {
        if (filters.rating.includes("4up") && business.rating < 4) return false;
        if (filters.rating.includes("3up") && business.rating < 3) return false;
      }

      // Price range filter
      if (filters.pricerange.length > 0) {
        if (!filters.pricerange.includes(business.pricerange)) return false;
      }

      // Open now filter
      if (filters.openNow.includes("showOnlyOpen")) {
        if (!business.isopen) return false;
      }

      // Distance range filter
      if (filters.distanceRange.length > 0 && userLocation) {
        // If user has location but business doesn't have valid coordinates, exclude it
        if (business.calculatedDistance === undefined || business.calculatedDistance >= 999999) {
          return false;
        }
        
        let matchesDistance = false;
        
        if (filters.distanceRange.includes("1km") && business.calculatedDistance <= 1) {
          matchesDistance = true;
        }
        if (filters.distanceRange.includes("5km") && business.calculatedDistance <= 5) {
          matchesDistance = true;
        }
        if (filters.distanceRange.includes("10km") && business.calculatedDistance <= 10) {
          matchesDistance = true;
        }
        if (filters.distanceRange.includes("25km") && business.calculatedDistance <= 25) {
          matchesDistance = true;
        }
        if (filters.distanceRange.includes("50km") && business.calculatedDistance <= 50) {
          matchesDistance = true;
        }
        
        if (!matchesDistance) {
          return false;
        }
      }

      return true;
    });

    return filtered;
  }, [businessesWithDistance, searchQuery, filters]);

  // Sort businesses
  const sortedBusinesses = useMemo(() => {
    const sorted = [...filteredBusinesses];
    
    console.log('🔄 Sorting businesses. Total:', sorted.length);
    console.log('📊 Sort settings:', {
      nearMeEnabled: filters.nearMe.includes("enabled"),
      hasUserLocation: !!userLocation,
      sortingOptions: filters.sorting
    });
    
    // If "Near Me" filter is enabled and user has location, sort by distance
    if (filters.nearMe.includes("enabled") && userLocation) {
      console.log('📍 Sorting by distance (nearest first)');
      sorted.sort((a, b) => {
        const distA = a.calculatedDistance !== undefined ? a.calculatedDistance : 999999;
        const distB = b.calculatedDistance !== undefined ? b.calculatedDistance : 999999;
        console.log(`Comparing: ${a.name} (${distA.toFixed(2)}km) vs ${b.name} (${distB.toFixed(2)}km)`);
        return distA - distB;
      });
    } else if (filters.sorting.includes("highestRated")) {
      console.log('⭐ Sorting by highest rated');
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (filters.sorting.includes("mostReviewed")) {
      console.log('💬 Sorting by most reviewed');
      sorted.sort((a, b) => b.reviews - a.reviews);
    } else if (filters.sorting.includes("alphabetical")) {
      console.log('🔤 Sorting alphabetically');
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    console.log('✅ Sorted businesses:', sorted.slice(0, 5).map(b => ({
      name: b.name,
      distance: b.calculatedDistance ? `${b.calculatedDistance.toFixed(2)}km` : 'N/A'
    })));
    
    return sorted;
  }, [filteredBusinesses, filters.sorting, filters.nearMe, userLocation]);

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
      openNow: [],
      distanceRange: [],
      nearMe: []
    });
    setCurrentPage(1);
  };

  const FilterSection: React.FC<FilterSectionProps> = ({ title, children, defaultOpen = true }) => {
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

  const CheckboxFilter: React.FC<CheckboxFilterProps> = ({ filterType, value, label, checked }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => handleFilterChange(filterType, value, e.target.checked)}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  // Get unique categories from results
  const resultCategories = useMemo(() => {
    const cats = new Set(filteredBusinesses.map(b => {
      const cat = categories.find(c => c.value === b.category);
      return cat?.label || b.category;
    }));
    return Array.from(cats).join(', ');
  }, [filteredBusinesses]);

  // Filter Sidebar Component
  const FilterSidebar = () => (
    <div className="bg-white rounded-lg shadow p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">Filter</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="text-blue-600 text-sm hover:underline"
          >
            Reset
          </button>
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="lg:hidden text-gray-600 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Location Filter Section */}
      <FilterSection title="Location & Distance" defaultOpen={true}>
        {/* Enable Location Button */}
        <button
          onClick={getUserLocation}
          disabled={locationLoading}
          className={`w-full mb-3 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
            userLocation
              ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {locationLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Getting Location...</span>
            </>
          ) : userLocation ? (
            <>
              <Navigation className="w-4 h-4" />
              <span className="text-sm">Location Enabled ✓</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span className="text-sm">Enable My Location</span>
            </>
          )}
        </button>

        {locationError && (
          <div className="mb-3 bg-amber-50 border border-amber-200 rounded p-2">
            <p className="text-xs text-amber-800">{locationError}</p>
          </div>
        )}

        {userLocation && (
          <div className="mb-3 bg-green-50 border border-green-200 rounded p-2">
            <p className="text-xs text-green-800">📍 Location enabled</p>
          </div>
        )}

        {/* Near Me Filter */}
        {userLocation && (
          <CheckboxFilter
            filterType="nearMe"
            value="enabled"
            label="🎯 Sort by Nearest First"
            checked={filters.nearMe.includes("enabled")}
          />
        )}

        {/* Distance Range Filters */}
        {userLocation && (
          <>
            <div className="text-xs text-gray-500 mt-3 mb-2 font-medium">Within Distance:</div>
            <CheckboxFilter
              filterType="distanceRange"
              value="1km"
              label="📍 Within 1 km"
              checked={filters.distanceRange.includes("1km")}
            />
            <CheckboxFilter
              filterType="distanceRange"
              value="5km"
              label="📍 Within 5 km"
              checked={filters.distanceRange.includes("5km")}
            />
            <CheckboxFilter
              filterType="distanceRange"
              value="10km"
              label="📍 Within 10 km"
              checked={filters.distanceRange.includes("10km")}
            />
            <CheckboxFilter
              filterType="distanceRange"
              value="25km"
              label="📍 Within 25 km"
              checked={filters.distanceRange.includes("25km")}
            />
            <CheckboxFilter
              filterType="distanceRange"
              value="50km"
              label="📍 Within 50 km"
              checked={filters.distanceRange.includes("50km")}
            />
          </>
        )}

        {!userLocation && (
          <p className="text-xs text-gray-500 italic">
            Enable location to filter by distance
          </p>
        )}
      </FilterSection>

      <FilterSection title="Category">
        {categories.map(cat => (
          <CheckboxFilter
            key={cat.value}
            filterType="category"
            value={cat.value}
            label={cat.label}
            checked={filters.category.includes(cat.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Sorting Options">
        <CheckboxFilter
          filterType="sorting"
          value="highestRated"
          label="Highest Rated"
          checked={filters.sorting.includes("highestRated")}
        />
        <CheckboxFilter
          filterType="sorting"
          value="mostReviewed"
          label="Most Reviewed"
          checked={filters.sorting.includes("mostReviewed")}
        />
        <CheckboxFilter
          filterType="sorting"
          value="alphabetical"
          label="Alphabetical"
          checked={filters.sorting.includes("alphabetical")}
        />
      </FilterSection>

      <FilterSection title="Ratings">
        <CheckboxFilter
          filterType="rating"
          value="4up"
          label="⭐⭐⭐⭐ & Up"
          checked={filters.rating.includes("4up")}
        />
        <CheckboxFilter
          filterType="rating"
          value="3up"
          label="⭐⭐⭐ & Up"
          checked={filters.rating.includes("3up")}
        />
      </FilterSection>

      <FilterSection title="Price Range">
        <CheckboxFilter
          filterType="pricerange"
          value="$"
          label="$ - Budget"
          checked={filters.pricerange.includes("$")}
        />
        <CheckboxFilter
          filterType="pricerange"
          value="$$"
          label="$$ - Moderate"
          checked={filters.pricerange.includes("$$")}
        />
        <CheckboxFilter
          filterType="pricerange"
          value="$$$"
          label="$$$ - Expensive"
          checked={filters.pricerange.includes("$$$")}
        />
        <CheckboxFilter
          filterType="pricerange"
          value="$$$$"
          label="$$$$ - Luxury"
          checked={filters.pricerange.includes("$$$$")}
        />
      </FilterSection>

      <FilterSection title="Open Now">
        <CheckboxFilter
          filterType="openNow"
          value="showOnlyOpen"
          label="Show only open businesses"
          checked={filters.openNow.includes("showOnlyOpen")}
        />
      </FilterSection>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SearchHeader/>
        <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading businesses...</span>
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
            <button 
              onClick={fetchBusinesses}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
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
          
          {/* Search Bar */}
          <form onSubmit={handleLocalSearch} className="mb-4">
            <div className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                placeholder="Search businesses, services, locations..."
                className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-4 py-2 m-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Search
              </button>
            </div>
          </form>
          
          {resultCategories && (
            <p className="text-sm text-gray-600 mt-1">
              Found in: {resultCategories}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden fixed bottom-6 left-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Filter size={20} />
          <span className="font-medium">Filters</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Sidebar - Filters */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20">
              <FilterSidebar />
            </div>
          </div>

          {/* Mobile Sidebar - Filters */}
          <div
            className={`lg:hidden fixed inset-0 z-50 transition-transform duration-300 ${
              isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Overlay */}
            <div
              className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                isMobileFilterOpen ? 'opacity-50' : 'opacity-0'
              }`}
              onClick={() => setIsMobileFilterOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto">
              <FilterSidebar />
            </div>
          </div>

          {/* Right Side - Results */}
          <div className="lg:col-span-3">
            {/* Results Info */}
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm md:text-base text-blue-800">
                  <strong>Search Results for:</strong> &quot;{searchQuery}&quot; 
                  <span className="ml-2 text-blue-600 block md:inline mt-1 md:mt-0">
                    Showing {currentBusinesses.length} of {sortedBusinesses.length} businesses
                  </span>
                  {userLocation && filters.nearMe.includes("enabled") && (
                    <span className="block md:inline text-green-600 mt-1 md:mt-0 md:ml-2">
                      📍 Sorted by nearest first
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Results */}
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
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {business.name}
                      </h3>
                      
                      {business.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin size={14} />
                          <span>{business.location.split(',')[0]}</span>
                        </div>
                      )}
                      
                      {userLocation && business.calculatedDistance && business.calculatedDistance < 999999 && (
                        <div className="text-sm text-blue-600 font-medium">
                          📍 {business.calculatedDistance < 1
                            ? `${(business.calculatedDistance * 1000).toFixed(0)}m away`
                            : `${business.calculatedDistance.toFixed(1)}km away`}
                        </div>
                      )}
                      
                      {business.contact && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone size={14} />
                          <span>{business.contact}</span>
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
                            <Clock size={14} className={business.isopen ? "text-green-600" : "text-red-600"} />
                            <span className={business.isopen ? "text-green-600" : "text-red-600"}>
                              {business.isopen ? "Open" : "Closed"} - {business.openhours}
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
                          className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* No Results */}
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
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 md:gap-2 mt-6 flex-wrap">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 md:px-3 py-2 text-sm md:text-base text-blue-600 hover:bg-blue-50 disabled:text-gray-400"
                >
                  « Prev
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-2 md:px-3 py-2 text-sm md:text-base rounded ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 md:px-3 py-2 text-sm md:text-base text-blue-600 hover:bg-blue-50 disabled:text-gray-400"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
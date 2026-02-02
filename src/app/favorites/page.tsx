// app/favorites/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  MapPin,
  Heart,
  Loader2,
  Trash2
} from 'lucide-react';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { supabase } from '@/lib/supabaseClient'; 
import { Business } from '@/types/business';


export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Load favorite IDs from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tookdeal:favorites");
      const ids: string[] = raw ? JSON.parse(raw) : [];
      console.log('Loaded favorite IDs:', ids);
      setFavoriteIds(ids);
    } catch (e) {
      console.error('Error loading favorites:', e);
      setFavoriteIds([]);
    }
  }, []);
  useEffect(() => {
  if (favoriteIds.length === 0) {
    document.title = "My Favorites | tookdeal";
  } else {
    document.title = `My Favorites (${favoriteIds.length}) | tookdeal`;
  }
}, [favoriteIds]);

  // Fetch businesses for favorite IDs
  useEffect(() => {
    async function fetchFavorites() {
      if (favoriteIds.length === 0) {
        console.log('No favorite IDs found');
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching businesses for IDs:', favoriteIds);
        
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .in('id', favoriteIds);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Fetched businesses:', data);
        setFavorites(data || []);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [favoriteIds]);

  // Listen for favorite changes
  useEffect(() => {
    const handleFavoritesChanged = (event: CustomEvent) => {
      console.log('Favorites changed event:', event.detail);
      setFavoriteIds(event.detail || []);
    };

    window.addEventListener('tookdeal:favorites:changed', handleFavoritesChanged as EventListener);

    return () => {
      window.removeEventListener('tookdeal:favorites:changed', handleFavoritesChanged as EventListener);
    };
  }, []);

  const removeFavorite = (businessId: string) => {
    try {
      const raw = localStorage.getItem("tookdeal:favorites");
      const arr: string[] = raw ? JSON.parse(raw) : [];
      const next = arr.filter((id) => id !== businessId);
      
      localStorage.setItem("tookdeal:favorites", JSON.stringify(next));
      setFavoriteIds(next);
      
      window.dispatchEvent(
        new CustomEvent("tookdeal:favorites:changed", { detail: next })
      );
    } catch (e) {
      console.error('Error removing favorite:', e);
    }
  };

  const clearAllFavorites = () => {
    if (confirm('Are you sure you want to remove all favorites?')) {
      try {
        localStorage.setItem("tookdeal:favorites", JSON.stringify([]));
        setFavoriteIds([]);
        setFavorites([]);
        
        window.dispatchEvent(
          new CustomEvent("tookdeal:favorites:changed", { detail: [] })
        );
      } catch (e) {
        console.error('Error clearing favorites:', e);
      }
    }
  };

  const BusinessCard = ({ business }: { business: Business }) => (
    <div 
      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:shadow-[#00d4ad]/20 dark:hover:shadow-[#00d4ad]/10 transition-all duration-300 group"
    >
      <div 
        className="aspect-video bg-gray-200 dark:bg-zinc-800 relative overflow-hidden cursor-pointer"
        onClick={() => router.push(`/business/${business.id}`)}
      >
        <img 
          src={business.image} 
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/300x200/3f3f46/a1a1aa?text=${encodeURIComponent(business.name)}`;
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeFavorite(business.id);
          }}
          className="absolute top-2 right-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-full p-2 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors group/delete border border-gray-200 dark:border-red-500/30 shadow-sm"
          title="Remove from favorites"
        >
          <Heart className="w-5 h-5 text-red-500 dark:text-red-400 fill-red-500 dark:fill-red-400 group-hover/delete:scale-110 transition-transform" />
        </button>
      </div>
      
      <div 
        className="p-4 cursor-pointer"
        onClick={() => router.push(`/business/${business.id}`)}
      >
        <h3 className="font-semibold text-slate-800 dark:text-white mb-1 group-hover:text-[#00d4ad] dark:group-hover:text-[#00e4bd] transition-colors duration-200">
          {business.name}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">{business.rating}</span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">({business.reviews})</span>
          </div>
          {business.isopen !== undefined && (
            <span className={`text-xs font-medium ${business.isopen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {business.isopen ? 'Open' : 'Closed'}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
          <MapPin className="w-3 h-3 text-slate-500 dark:text-zinc-500 flex-shrink-0" />
          <span className="text-xs truncate">{business.location?.split(',')[0] || business.location}</span>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-[#00d4ad] dark:text-[#00e4bd] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            View Details →
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFavorite(business.id);
            }}
            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />

      <main className="max-w-7xl mx-auto pt-28 px-6 pb-16">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-8 h-8 text-red-500 dark:text-red-400 fill-red-500 dark:fill-red-400" />
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">My Favorites</h1>
              </div>
              <p className="text-slate-600 dark:text-zinc-400">
                {favoriteIds.length === 0 
                  ? "You haven't added any favorites yet" 
                  : `${favoriteIds.length} favorite ${favoriteIds.length === 1 ? 'business' : 'businesses'}`}
              </p>
            </div>

            {/* Clear All Button */}
            {favoriteIds.length > 0 && !loading && (
              <button
                onClick={clearAllFavorites}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/70 border border-red-200 dark:border-red-800 transition-colors text-sm shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded text-xs text-gray-900 dark:text-zinc-300">
            <p>Favorite IDs: {JSON.stringify(favoriteIds)}</p>
            <p>Loaded businesses: {favorites.length}</p>
            <p>Loading: {loading.toString()}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#00d4ad] mx-auto mb-4" />
              <p className="text-slate-600 dark:text-zinc-400 text-lg">Loading your favorites...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && favoriteIds.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-50 dark:bg-zinc-900 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-12">
              <Heart className="w-16 h-16 text-gray-300 dark:text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 dark:text-zinc-300 mb-2">No favorites yet</h2>
              <p className="text-slate-500 dark:text-zinc-400 mb-6">
                Start exploring and save your favorite businesses!
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-[#00d4ad] text-white px-6 py-3 rounded-lg hover:bg-[#00b89a] transition-colors shadow-md hover:shadow-lg"
              >
                Browse Businesses
              </button>
            </div>
          </div>
        )}

        {/* No Results but have IDs */}
        {!loading && favoriteIds.length > 0 && favorites.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-yellow-800 dark:text-yellow-400 mb-4">
                Some favorites couldn't be loaded. They may have been removed from the platform.
              </p>
              <button
                onClick={() => {
                  localStorage.setItem("tookdeal:favorites", JSON.stringify([]));
                  setFavoriteIds([]);
                }}
                className="bg-yellow-600 dark:bg-yellow-700 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-800 transition-colors text-sm shadow-sm"
              >
                Clear Invalid Favorites
              </button>
            </div>
          </div>
        )}

        {/* Favorites Grid */}
        {!loading && favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map(business => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}

        {/* Note about partial results */}
        {!loading && favoriteIds.length > 0 && favorites.length > 0 && favorites.length < favoriteIds.length && (
          <div className="mt-6 text-center">
            <div className="inline-block bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                {favoriteIds.length - favorites.length} favorite{favoriteIds.length - favorites.length !== 1 ? 's' : ''} couldn't be loaded
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
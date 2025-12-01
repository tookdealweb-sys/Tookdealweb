// hooks/useBusinessData.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Business, BusinessDetails, BusinessImage, Review } from '@/types/business';

// Hook for fetching all businesses (list view)
interface UseBusinessDataReturn {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBusinessData(): UseBusinessDataReturn {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  async function fetchBusinesses(): Promise<void> {
    try {
      setLoading(true);
      
      console.log('Fetching businesses...');
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('rating', { ascending: false });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return { businesses, loading, error, refetch: fetchBusinesses };
}

// Hook for fetching single business details (detail view)
interface UseBusinessDetailReturn {
  business: Business | null;
  details: BusinessDetails | null;
  images: BusinessImage[];
  reviews: Review[];
  loading: boolean;
  error: string | null;
}

export function useBusinessDetail(businessId: string): UseBusinessDetailReturn {
  const [business, setBusiness] = useState<Business | null>(null);
  const [details, setDetails] = useState<BusinessDetails | null>(null);
  const [images, setImages] = useState<BusinessImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (businessId) {
      fetchAllData();
    }
  }, [businessId]);

  async function fetchAllData() {
    try {
      setLoading(true);

      // Fetch main business data
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (businessError) throw businessError;
      setBusiness(businessData);

      // Fetch business details
      const { data: detailsData, error: detailsError } = await supabase
        .from('business_details')
        .select('*')
        .eq('business_id', businessId)
        .single();

      if (detailsError && detailsError.code !== 'PGRST116') {
        console.error('Details error:', detailsError);
      }
      setDetails(detailsData);

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('business_images')
        .select('*')
        .eq('business_id', businessId)
        .order('display_order', { ascending: true });

      if (imagesError) throw imagesError;
      setImages(imagesData || []);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load business');
    } finally {
      setLoading(false);
    }
  }

  return { business, details, images, reviews, loading, error };
}
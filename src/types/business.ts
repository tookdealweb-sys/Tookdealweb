// types/business.ts

export interface Business {
  id: string;
  name: string;
  category: string;
  location?: string;
  rating: number;
  reviews: number;
  image: string;
  services?: string;
  isopen?: boolean;
  
  // Detail page fields (optional)
  contact?: string; // WhatsApp/Phone number
  email?: string;
  hours?: string;
  description?: string;
  
  // Reviews data (optional)
  reviews_data?: Array<{
    id: string;
    author: string;
    rating: number;
    date: string;
    text: string;
    helpful: number;
  }>;
}

// Add these new interfaces
export interface BusinessDetails {
  id: string;
  business_id: string;
  description?: string;
  hours?: string;
  amenities?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface BusinessImage {
  id: string;
  business_id: string;
  image_url: string;
  display_order: number;
  alt_text?: string;
  created_at?: string;
}

export interface Review {
  id: string;
  business_id: string;
  author: string;
  rating: number;
  comment: string;
  date?: string;
  created_at: string;
  helpful?: number;
}
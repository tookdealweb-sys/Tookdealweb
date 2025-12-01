// app/business/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/footer";
import Header from "@/components/header";
import ImageGallery from "@/components/detailed/ImageGallery";
import Reviews from "@/components/detailed/Reviews";
import ContactSection from "@/components/detailed/ContactSection";
import { FaWhatsapp, FaHeart, FaShare } from "react-icons/fa";
import { MdOutlineDirections } from "react-icons/md";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Business } from "@/types/business";
import Link from "next/link";

// Extended type for business details
interface BusinessDetail extends Business {
  contact?: string;
  email?: string;
  hours?: string;
  images?: string[] | string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  helpful: number;
}

interface ImagesObject {
  hero: string;
  gallery: string[];
}

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shared, setShared] = useState(false);
  const [showFavoriteMessage, setShowFavoriteMessage] = useState(false);
  const [whatsappTracking, setWhatsappTracking] = useState(false);

  // Fetch business data
  useEffect(() => {
    async function fetchBusiness() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", businessId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Business not found");

        console.log("Fetched business data:", data);
        setBusiness(data as BusinessDetail);
      } catch (err) {
        console.error("Error fetching business:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load business"
        );
      } finally {
        setLoading(false);
      }
    }

    if (businessId) {
      fetchBusiness();
    }
  }, [businessId]);

  // Fetch reviews from Supabase
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Format reviews data to match Review interface
      const formattedReviews: Review[] = (data || []).map((review: any) => ({
        id: review.id,
        author: review.author,
        rating: review.rating,
        date: review.created_at,
        text: review.text,
        helpful: review.helpful || 0,
      }));

      setReviews(formattedReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  // Check if favorited
  useEffect(() => {
    if (!business) return;

    try {
      const raw = localStorage.getItem("tookdeal:favorites");
      const arr: string[] = raw ? JSON.parse(raw) : [];
      setIsFavorite(arr.includes(business.id));
    } catch (e) {
      console.error(e);
    }
  }, [business]);

  const toggleFavorite = () => {
    if (!business) return;

    try {
      const raw = localStorage.getItem("tookdeal:favorites");
      const arr: string[] = raw ? JSON.parse(raw) : [];
      let next: string[];

      if (arr.includes(business.id)) {
        next = arr.filter((id) => id !== business.id);
        setIsFavorite(false);
        setShowFavoriteMessage(false);
      } else {
        next = [...arr, business.id];
        setIsFavorite(true);

        setShowFavoriteMessage(true);
        setTimeout(() => {
          setShowFavoriteMessage(false);
        }, 3000);
      }

      localStorage.setItem("tookdeal:favorites", JSON.stringify(next));
      window.dispatchEvent(
        new CustomEvent("tookdeal:favorites:changed", { detail: next })
      );
    } catch (e) {
      console.error(e);
    }
  };

  const shareListing = async () => {
    if (!business) return;

    try {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/business/${business.id}`
          : "";

      if (navigator.share) {
        await navigator.share({
          title: business.name,
          text: `Check out ${business.name} on TookDeal`,
          url,
        });
        setShared(true);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShared(true);
      } else {
        window.prompt("Copy this link", url);
      }
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => setShared(false), 2500);
  };

  // Enhanced WhatsApp click tracking
  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    if (!business || whatsappTracking) return;

    // Don't prevent default - let the link work
    // We're tracking in parallel

    setWhatsappTracking(true);

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Get authentication token if available
      const token = session?.access_token;

      // Track the click
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
      // Don't block the user from proceeding
    } finally {
      setWhatsappTracking(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading business details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !business) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center max-w-md w-full">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 font-semibold mb-2">
                Business Not Found
              </p>
              <p className="text-red-500 text-sm mb-4">
                {error || "The business you are looking for does not exist."}
              </p>
              <button
                onClick={() => router.push("/")}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Prepare images
  let galleryImages: string[] = [];
  
  if (business.images) {
    if (Array.isArray(business.images)) {
      galleryImages = business.images;
    } else if (typeof business.images === 'string') {
      galleryImages = [business.images];
    }
  }

  const images: ImagesObject = {
    hero: business.image || "https://via.placeholder.com/1200x600",
    gallery:
      galleryImages.length > 0
        ? galleryImages
        : [business.image || "https://via.placeholder.com/800x600"],
  };

  // Prepare WhatsApp link
  const waNumber = business.contact?.replace(/[^0-9]/g, "") || "";
  const waMessage = `Hi, I found your business ${business.name} on TookDeal. I'd like to know more.`;
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`
    : "";

  // Prepare contact info
  const contact = {
    phone: business.contact || undefined,
    email: business.email || undefined,
    address: business.location || undefined,
    workingDay: business.hours || undefined,
  };

  // Generate map embed URL
  const mapSrc = business.location
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        business.location
      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : "";

  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden">
      <Header />

      {/* Success Message Toast */}
      {showFavoriteMessage && (
        <div className="fixed top-24 right-4 md:right-6 z-50 animate-slide-in-right max-w-[calc(100vw-2rem)]">
          <div className="bg-green-500 text-white px-4 md:px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <FaHeart className="text-xl flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold">Added to Favorites!</p>
              <button
                onClick={() => router.push("/favorites")}
                className="text-sm underline hover:text-green-100"
              >
                View all favorites →
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto pt-28 px-4 md:px-6 pb-16">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to listings
          </button>
        </div>

        {/* Title and Actions */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mt-3">
            {/* Left side */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-semibold break-words">
                {business.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.floor(business.rating || 0)
                          ? ""
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  {business.rating || 0} ({reviews.length} reviews)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                {waHref && (
                  <Link
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsAppClick}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 md:px-6 py-2 rounded-md text-sm font-medium shadow hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaWhatsapp className="text-lg" />
                    {whatsappTracking ? 'Connecting...' : 'WhatsApp'}
                  </Link>
                )}

                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    business.location || business.name
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-700 hover:underline"
                >
                  <MdOutlineDirections className="text-xl" />
                  Direction
                </Link>
              </div>
            </div>

            {/* Right side (Share + Favorite) */}
            <div className="flex items-center gap-4 md:gap-6 text-sm">
              <button
                onClick={shareListing}
                className="flex items-center gap-1 hover:underline transition-colors"
              >
                <FaShare
                  className={shared ? "text-emerald-600" : "text-gray-500"}
                />
                <span className={shared ? "text-emerald-600" : "text-gray-600"}>
                  {shared ? "Shared" : "Share"}
                </span>
              </button>

              <button
                onClick={toggleFavorite}
                aria-pressed={isFavorite}
                className="flex items-center gap-1 hover:underline transition-all"
              >
                <FaHeart
                  className={`${
                    isFavorite ? "text-red-500 scale-110" : "text-gray-500"
                  } transition-all`}
                />
                <span
                  className={
                    isFavorite ? "text-red-500 font-medium" : "text-gray-600"
                  }
                >
                  {isFavorite ? "Favorited" : "Add to Favorite"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <ImageGallery images={images} />

        {/* Contact Section */}
        <ContactSection contact={contact} mapSrc={mapSrc} />

        {/* Reviews */}
        {reviewsLoading ? (
          <div className="mt-12 text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        ) : (
          <Reviews
            items={reviews}
            businessId={businessId}
            onReviewAdded={fetchReviews}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
// components/detailed/Reviews.tsx
"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { Loader2 } from "lucide-react";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  helpful: number;
}

interface ReviewsProps {
  items: Review[];
  businessId: string;
  onReviewAdded?: () => void;
}

export default function Reviews({ items, businessId, onReviewAdded }: ReviewsProps) {
  const [showAddReview, setShowAddReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    author: "",
    rating: 5,
    text: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.author.trim() || !formData.text.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_id: businessId,
          author: formData.author.trim(),
          rating: formData.rating,
          text: formData.text.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      // Reset form
      setFormData({
        author: "",
        rating: 5,
        text: "",
      });
      setShowAddReview(false);

      // Notify parent to refresh reviews
      if (onReviewAdded) {
        onReviewAdded();
      }

      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold">Customer Reviews</h3>
        <button
          onClick={() => setShowAddReview(!showAddReview)}
          className="bg-[#00d4ad] text-white px-4 py-2 rounded-md hover:bg-[#00d4ad] text-sm font-medium"
        >
          {showAddReview ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4">Write Your Review</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00d4ad] focus:border-[#00d4ad]"
                placeholder="Enter your name"
                required
                disabled={submitting}
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="text-3xl focus:outline-none transition-colors"
                    disabled={submitting}
                  >
                    <FaStar
                      className={
                        star <= formData.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                Your Review *
              </label>
              <textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00d4ad] focus:border-[#00d4ad] resize-none"
                placeholder="Share your experience..."
                required
                disabled={submitting}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#00d4ad] text-white px-6 py-2 rounded-md hover:bg-[#00d4ad] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-200 pb-6 last:border-b-0"
            >
              {/* Review Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-800">{review.author}</p>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < review.rating ? "" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
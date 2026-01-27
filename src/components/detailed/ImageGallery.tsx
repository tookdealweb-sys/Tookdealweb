"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { X } from "lucide-react";

type Props = {
  images?: {
    hero?: string;
    gallery?: string[];
  };
};

export default function ImageGallery({ images }: Props) {
  const [open, setOpen] = useState(false);

  // Use passed-in images, fallback to local placeholders if not provided
  const gallery = images?.gallery ?? [
    "/images/car1.png",
    "/images/car2.png",
    "/images/car3.png",
    "/images/car4.png",
    "/images/car1.png",
  ];

  const hero = images?.hero ?? gallery[0];

  return (
    <div>
      {/* Grid Preview */}
      <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden">
        <img src={hero} alt="hero" className="col-span-2 h-64 w-full object-cover" />
        <img src={gallery[0]} alt="thumb1" className="h-64 w-full object-cover" />
        <img src={gallery[1]} alt="thumb2" className="h-32 w-full object-cover" />
        <img src={gallery[2]} alt="thumb3" className="h-32 w-full object-cover" />
        <button
          onClick={() => setOpen(true)}
          className="relative z-[99] h-32 w-full bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors font-medium"
        >
          Show all Images
        </button>
      </div>

      {/* Fullscreen Lightbox Slider */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/95 z-[9999] flex flex-col"
        >
          {/* Close Button */}

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="fixed top-4 right-4 z-[10000] inline-flex h-10 w-10 items-center justify-center
                    rounded-full bg-white/10 hover:bg-white/20 focus:outline-none transition-colors"
            aria-label="Close gallery"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Swiper Slider */}
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="w-full h-full"
          >
            {gallery.map((img, idx) => (
              <SwiperSlide key={idx}>
                <div className="flex justify-center items-center h-full">
                  <img src={img} alt={`slide-${idx}`} className="max-h-[90vh] object-contain" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      )}
    </div>
  );
}
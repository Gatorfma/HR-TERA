import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Images } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductGalleryProps {
  screenshots: string[];
  productName: string;
  videoUrl?: string;
}

const embedUrl = (url?: string) => {
  if (!url) return undefined;

  try {
    const u = new URL(url);

    // YouTube
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      // already embed
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }

    return url; // fallback (might still not be embeddable)
  } catch {
    return url;
  }
};

const ProductGallery = ({ screenshots, productName, videoUrl }: ProductGalleryProps) => {
  const { t } = useLanguage();
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const embededUrl = embedUrl(videoUrl);

  if (!screenshots || screenshots.length === 0) return null;

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h2 className="text-2xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
          <Images className="w-5 h-5 text-primary" />
          {t("productTabs.gallery")}
        </h2>

        {/* Video */}
        {embededUrl && (
          <div className="mb-6 rounded-xl overflow-hidden border border-border">
            <div className="aspect-video">
              <iframe
                src={embededUrl}
                title={`${productName} demo video`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Screenshots Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {screenshots.map((screenshot, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="relative group rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all"
            >
              <img
                src={screenshot}
                alt={`${productName} screenshot ${index + 1}`}
                className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Lightbox - rendered via portal to ensure it covers entire screen */}
      {createPortal(
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md"
              style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
              onClick={closeLightbox}
            >
              <motion.img
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                src={screenshots[activeIndex]}
                alt={`${productName} screenshot ${activeIndex + 1}`}
                className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default ProductGallery;

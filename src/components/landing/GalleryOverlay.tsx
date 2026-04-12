import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MediaLightbox } from "@/components/ui/media-lightbox";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface GalleryOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function GalleryOverlay({ open, onClose }: GalleryOverlayProps) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string; type: "image" | "video" } | null>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ["gallery-overlay-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, title, image_url, thumbnail_url, media_type, alt_text")
        .eq("is_active", true)
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              background: "rgba(0,10,30,0.92)",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          >
            {/* Header */}
            <div style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              background: "rgba(0,10,30,0.95)",
              backdropFilter: "blur(8px)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div>
                <h2 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Our Work</h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: "2px 0 0" }}>
                  {images ? `${images.length} photos` : "Loading…"}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close gallery"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Grid */}
            <div style={{ padding: "20px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
              {isLoading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.5)" }}>
                  <div style={{
                    width: 36, height: 36, border: "3px solid rgba(255,255,255,0.15)",
                    borderTopColor: "#FFB547", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto 12px",
                  }} />
                  Loading gallery…
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 12,
                }}>
                  {images?.map((img) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setLightbox({
                        src: img.image_url,
                        alt: img.alt_text || img.title || "Gallery image",
                        type: (img.media_type === "video" ? "video" : "image"),
                      })}
                      style={{
                        aspectRatio: "4/3",
                        borderRadius: 8,
                        overflow: "hidden",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      <img
                        src={img.thumbnail_url || img.image_url}
                        alt={img.alt_text || img.title || "Gallery image"}
                        loading="lazy"
                        decoding="async"
                        width={400}
                        height={300}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                      {img.title && (
                        <div style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "20px 8px 6px",
                          background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                          color: "#fff",
                          fontSize: "0.72rem",
                          lineHeight: 1.3,
                        }}>
                          {img.title}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {lightbox && (
        <MediaLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          mediaType={lightbox.type}
          open={!!lightbox}
          onOpenChange={(open) => { if (!open) setLightbox(null); }}
        />
      )}
    </>
  );
}

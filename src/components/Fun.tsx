import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ExternalLink, 
  Laptop, 
  Sparkles, 
  Sun, 
  Gamepad2, 
  Rocket, 
  Zap,
  X,
  Maximize2
} from "lucide-react";
import { profileData, ProfileData } from "../data/profile";

function getTimelineIcon(category: string) {
  const cat = category.toUpperCase();
  if (cat.includes("TOOLKIT")) return <Laptop size={14} className="text-neutral-500" />;
  if (cat.includes("PHILOSOPHY")) return <Sparkles size={14} className="text-neutral-500" />;
  if (cat.includes("ROUTINE")) return <Sun size={14} className="text-neutral-500" />;
  if (cat.includes("GAMING")) return <Gamepad2 size={14} className="text-neutral-500" />;
  if (cat.includes("LEARNING")) return <Rocket size={14} className="text-neutral-500" />;
  if (cat.includes("WORKSPACE")) return <Zap size={14} className="text-neutral-500" />;
  return <Sparkles size={14} className="text-neutral-500" />;
}

interface FunProps {
  profile?: ProfileData;
}

export default function Fun({ profile }: FunProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const p = profile || profileData;
  const funFacts = p?.funFacts || profileData.funFacts || [];

  return (
    <section 
      id="fun" 
      className="mx-auto max-w-4xl px-4 py-8 sm:py-12 border-b border-neutral-200/60"
    >
      {/* Header section */}
      <div className="mb-12 flex flex-col" id="fun-header-container">
        <div className="flex justify-between items-baseline border-b border-neutral-200 pb-4 mb-4">
          <h2 
            id="fun-title"
            className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 uppercase"
          >
            Behind the Designer
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-xl leading-relaxed" id="fun-subtitle">
          The person behind the portfolio—my interests, daily routine, creative mindset, and the tools that inspire every project I create.
        </p>
      </div>

      {/* Elegant Vertical Timeline (Without borders or card boxes) */}
      <div className="relative pl-6 sm:pl-8 border-l border-neutral-200/80 ml-3 sm:ml-4 space-y-12 py-2" id="fun-timeline">
        {funFacts.map((fact, index) => (
          <motion.div
            key={fact.title}
            id={`fun-timeline-item-${index}`}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group"
          >
            {/* Timeline node marker */}
            <div 
              className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-neutral-200 shadow-xs flex items-center justify-center group-hover:border-neutral-400 group-hover:shadow-sm transition-all duration-350"
              id={`fun-timeline-node-${index}`}
            >
              {getTimelineIcon(fact.category)}
            </div>

            {/* Content area - clean typography, no card containers */}
            <div className="space-y-1.5" id={`fun-content-area-${index}`}>
              {/* Category tag */}
              <span 
                id={`fun-card-category-${index}`}
                className="block font-mono text-[9px] sm:text-[10px] font-black text-neutral-400 uppercase tracking-widest"
              >
                {fact.category}
              </span>
              
              {/* Title */}
              <h3 
                id={`fun-card-title-${index}`}
                className="font-sans text-sm sm:text-base font-extrabold text-neutral-900 group-hover:text-neutral-750 transition-colors"
              >
                {fact.title}
              </h3>

              {/* Body Text */}
              <p 
                id={`fun-card-value-${index}`}
                className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-sans max-w-2xl"
              >
                {fact.value}
              </p>

              {/* Showcase gaming/profile image inline instead of as an external link */}
              {fact.image && (
                <div className="mt-3 relative inline-block group/img max-w-xs sm:max-w-sm" id={`fun-showcase-img-container-${index}`}>
                  <img
                    src={fact.image}
                    alt={`${fact.title} profile avatar`}
                    referrerPolicy="no-referrer"
                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl object-cover border border-neutral-200/80 shadow-xs group-hover/img:shadow-sm transition-all duration-300 cursor-zoom-in"
                    onClick={() => setSelectedImage(fact.image || null)}
                    id={`fun-card-showcase-image-${index}`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 rounded-2xl transition-all duration-300 pointer-events-none flex items-center justify-center">
                    <Maximize2 size={16} className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                  </div>
                </div>
              )}

              {/* Sub-actions (UID tag only, without Free Fire link button) */}
              {(fact.uid || (fact.tiktokUrl && !fact.category.toUpperCase().includes("GAMING"))) && (
                <div 
                  className="flex flex-wrap items-center gap-3 pt-2"
                  id={`fun-timeline-actions-${index}`}
                >
                  {fact.uid && (
                    <div 
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-100/80 border border-neutral-200/50 rounded text-[9px] sm:text-[10px] font-mono text-neutral-600"
                      id={`fun-timeline-uid-${index}`}
                    >
                      <span className="text-[8px] text-neutral-400 uppercase font-black tracking-wider">UID:</span>
                      <span className="font-bold text-neutral-800">{fact.uid}</span>
                    </div>
                  )}
                  {fact.tiktokUrl && !fact.category.toUpperCase().includes("GAMING") && (
                    <a
                      href={fact.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-black hover:bg-neutral-800 text-white rounded text-[9px] sm:text-[10px] font-bold tracking-wide uppercase transition-colors cursor-pointer shadow-xs"
                      id={`fun-timeline-link-${index}`}
                    >
                      <span>TikTok Link</span>
                      <ExternalLink size={9} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Premium Lightbox Modal for Zooming Images */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-neutral-950/80 z-50 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-xs"
            id="fun-lightbox-overlay"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
              id="fun-lightbox-card"
            >
              <img
                src={selectedImage}
                alt="Profile Showcase"
                referrerPolicy="no-referrer"
                className="w-full h-auto aspect-square object-cover"
                id="fun-lightbox-img"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                id="fun-lightbox-close"
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

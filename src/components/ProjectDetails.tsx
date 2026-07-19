import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, User, Cpu, Tag, ExternalLink, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ProjectCMS {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: "Graphic Design" | "Branding" | "Packaging Design" | "Web Design";
  thumbnail: string;
  gallery: string[];
  tags: string[];
  software_used: string[];
  client?: string;
  completion_date: string;
  project_url?: string;
  featured: boolean;
  status: "Published" | "Draft";
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface ProjectDetailsProps {
  project: ProjectCMS;
  allProjects: ProjectCMS[];
  onClose: () => void;
  onNavigateToSlug: (slug: string) => void;
}

export default function ProjectDetails({
  project,
  allProjects,
  onClose,
  onNavigateToSlug
}: ProjectDetailsProps) {
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Find index of current project for navigation
  const currentIndex = allProjects.findIndex((p) => p.slug === project.slug);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  // Filter related projects (excluding current, matching category)
  const relatedProjects = allProjects
    .filter((p) => p.category === project.category && p.slug !== project.slug)
    .slice(0, 2);

  // Scroll to top on project load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [project.slug]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans" id="project-details-page">
      {/* Back Button and Section Name */}
      <div className="flex justify-between items-center mb-8" id="details-header-nav">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Creations
        </button>
        <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest font-black">
          {project.category}
        </span>
      </div>

      {/* Dynamic SEO Title & Subheading */}
      <div className="mb-6" id="details-title-section">
        <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight uppercase mb-3 leading-none">
          {project.title}
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 max-w-2xl leading-relaxed">
          {project.short_description}
        </p>
      </div>

      {/* Large Optimized Hero Image */}
      <div className="relative w-full h-[280px] sm:h-[460px] rounded-2xl overflow-hidden border border-neutral-200/50 bg-neutral-100 shadow-sm mb-10 group" id="details-hero-container">
        <img
          src={project.thumbnail}
          alt={project.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Main Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16" id="details-content-grid">
        {/* Left Span: Description & Multi-Image Gallery */}
        <div className="lg:col-span-8 space-y-10" id="details-main-body">
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-bold font-mono">
              The Design Challenge & Process
            </h2>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans whitespace-pre-line">
              {project.description || "No full description provided."}
            </p>
          </div>

          {/* Image Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <div className="space-y-4" id="details-gallery-section">
              <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-bold font-mono">
                Asset Showcase Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.gallery.map((imgUrl, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.015 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => setActiveLightboxImage(imgUrl)}
                    className="aspect-4/3 rounded-xl overflow-hidden border border-neutral-150 bg-neutral-50 shadow-xs cursor-zoom-in"
                  >
                    <img
                      src={imgUrl}
                      alt={`${project.title} gallery asset ${i + 1}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Span: Structured Metadata Card */}
        <div className="lg:col-span-4" id="details-meta-sidebar">
          <div className="bg-neutral-50/60 border border-neutral-200/60 rounded-2xl p-6 sticky top-6 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-3 font-mono">
              Project Parameters
            </h3>

            {/* Metadata Fields */}
            <div className="space-y-4 text-xs">
              {/* Category */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-neutral-100 flex items-center justify-center text-neutral-500 mt-0.5">
                  <Tag size={12} />
                </div>
                <div>
                  <span className="block text-[10px] text-neutral-400 font-bold uppercase font-mono">Specialization</span>
                  <span className="font-bold text-neutral-800">{project.category}</span>
                </div>
              </div>

              {/* Client */}
              {project.client && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-neutral-100 flex items-center justify-center text-neutral-500 mt-0.5">
                    <User size={12} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase font-mono">Client</span>
                    <span className="font-semibold text-neutral-800">{project.client}</span>
                  </div>
                </div>
              )}

              {/* Completion Date */}
              {project.completion_date && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-neutral-100 flex items-center justify-center text-neutral-500 mt-0.5">
                    <Calendar size={12} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase font-mono">Completed</span>
                    <span className="font-semibold text-neutral-800">
                      {project.completion_date}
                    </span>
                  </div>
                </div>
              )}

              {/* Software Used */}
              {project.software_used && project.software_used.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-neutral-100 flex items-center justify-center text-neutral-500 mt-0.5">
                    <Cpu size={12} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase font-mono mb-1">Software Toolkit</span>
                    <div className="flex flex-wrap gap-1">
                      {project.software_used.map((soft) => (
                        <span
                          key={soft}
                          className="px-2 py-0.5 bg-white border border-neutral-200 rounded text-[9px] text-neutral-600 font-medium font-mono"
                        >
                          {soft}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-neutral-100 flex items-center justify-center text-neutral-500 mt-0.5">
                    <Tag size={12} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase font-mono mb-1">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-neutral-100 text-[9px] text-neutral-500 rounded font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Project URL */}
            {project.project_url && (
              <div className="pt-4 border-t border-neutral-200">
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold tracking-wide uppercase transition-colors cursor-pointer"
                >
                  <ExternalLink size={12} />
                  Visit Design URL
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nav Row: Previous & Next Project Navigation */}
      <div className="flex justify-between items-center py-6 border-t border-b border-neutral-200 mb-16" id="details-prev-next-nav">
        <div>
          {prevProject ? (
            <button
              onClick={() => onNavigateToSlug(prevProject.slug)}
              className="group flex flex-col text-left cursor-pointer"
            >
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors group-hover:text-black font-mono">
                <ChevronLeft size={12} /> Previous Case
              </span>
              <span className="text-xs sm:text-sm font-bold text-neutral-800 group-hover:text-blue-600 mt-0.5 transition-colors max-w-[160px] sm:max-w-xs truncate">
                {prevProject.title}
              </span>
            </button>
          ) : (
            <div className="text-left select-none opacity-20">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">
                First Case
              </span>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-neutral-200" />

        <div>
          {nextProject ? (
            <button
              onClick={() => onNavigateToSlug(nextProject.slug)}
              className="group flex flex-col text-right cursor-pointer"
            >
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1 justify-end transition-colors group-hover:text-black font-mono">
                Next Case <ChevronRight size={12} />
              </span>
              <span className="text-xs sm:text-sm font-bold text-neutral-800 group-hover:text-blue-600 mt-0.5 transition-colors max-w-[160px] sm:max-w-xs truncate">
                {nextProject.title}
              </span>
            </button>
          ) : (
            <div className="text-right select-none opacity-20">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">
                Latest Case
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Related Projects Grid */}
      {relatedProjects.length > 0 && (
        <div className="space-y-6" id="details-related-section">
          <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-3 font-mono">
            Related Creative Work
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedProjects.map((p) => (
              <div
                key={p.slug}
                onClick={() => onNavigateToSlug(p.slug)}
                className="group cursor-pointer bg-white border border-neutral-200/80 rounded-2xl overflow-hidden hover:shadow-md hover:border-neutral-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      {p.category}
                    </span>
                    <h3 className="font-sans text-xs sm:text-sm font-bold text-neutral-950 group-hover:text-blue-600 transition-colors truncate">
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 leading-normal line-clamp-2 mt-1">
                      {p.short_description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightboxImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-4 right-4 text-white hover:text-neutral-300 p-2 text-xs font-mono tracking-wider cursor-pointer bg-neutral-900/60 rounded-full"
            >
              CLOSE
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={activeLightboxImage}
              alt="Expanded design asset"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

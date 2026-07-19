import { useState, useEffect } from "react";
import { ExternalLink, Github, Search, Eye, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { profileData, Project } from "../data/profile";
import ProjectDetails, { ProjectCMS } from "./ProjectDetails";

type CategoryType = "Web" | "Graphics";
type SubCategoryType = "All" | "Graphic Design" | "Branding" | "Packaging Design" | "Web Design";

export default function Projects({ profile }: { profile?: any }) {
  const pData = profile || profileData;
  const projects = pData?.projects || profileData.projects || [];
  const [activeCategory, setActiveCategory] = useState<CategoryType>("Web");
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategoryType>("All");
  
  // Dynamic Graphics projects state
  const [graphicsProjects, setGraphicsProjects] = useState<ProjectCMS[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Hash state deep link router
  const [selectedProject, setSelectedProject] = useState<ProjectCMS | null>(null);

  // Fetch dynamic graphics projects on mount
  useEffect(() => {
    async function loadGraphics() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/graphics-projects");
        if (!res.ok) throw new Error("Failed to fetch creations database");
        const data = await res.json();
        setGraphicsProjects(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError("Unable to connect to database. Showing backup local projects.");
        
        // Backup mapping from static data if database is unavailable
        const backup: ProjectCMS[] = projects
          .filter((p) => p.category === "Graphics")
          .map((p, i) => ({
            id: `backup-${i}`,
            title: p.title,
            slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            short_description: p.description,
            description: p.description,
            category: (p.subCategory || "Graphic Design") as any,
            thumbnail: i === 0 
              ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
              : i === 1
              ? "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80"
              : "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
            gallery: [],
            tags: p.tags,
            software_used: ["Adobe Illustrator", "Photoshop"],
            client: "Studio Client",
            completion_date: "2024",
            featured: true,
            status: "Published",
            display_order: i,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
        setGraphicsProjects(backup);
      } finally {
        setIsLoading(false);
      }
    }
    loadGraphics();
  }, []);

  // Listen for hash route deep links (e.g. #project/swiss-typographic-poster-series)
  useEffect(() => {
    const handleHashRouter = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#project/")) {
        const slug = hash.replace("#project/", "");
        const found = graphicsProjects.find((p) => p.slug === slug);
        if (found) {
          setSelectedProject(found);
          setActiveCategory("Graphics"); // auto-switch category
        }
      } else {
        setSelectedProject(null);
      }
    };

    // Only route once graphics list is loaded
    if (graphicsProjects.length > 0) {
      handleHashRouter();
    }

    window.addEventListener("hashchange", handleHashRouter);
    return () => window.removeEventListener("hashchange", handleHashRouter);
  }, [graphicsProjects, window.location.hash]);

  const handleCategoryChange = (category: CategoryType) => {
    setActiveCategory(category);
    setActiveSubCategory("All");
    setSearchQuery("");
  };

  const handleNavigateToSlug = (slug: string) => {
    window.location.hash = `#project/${slug}`;
  };

  const handleCloseDetails = () => {
    window.location.hash = "#projects";
    setSelectedProject(null);
  };

  // Get filtered projects
  const getFilteredWebProjects = (): Project[] => {
    return projects.filter((p) => p.category === "Web");
  };

  const getFilteredGraphicsProjects = (): ProjectCMS[] => {
    let list = [...graphicsProjects];

    // Filter by subcategory
    if (activeSubCategory !== "All") {
      list = list.filter((p) => p.category === activeSubCategory);
    }

    // Filter by search query (title or tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return list;
  };

  // Render project details page if deep linked
  if (selectedProject) {
    return (
      <ProjectDetails
        project={selectedProject}
        allProjects={graphicsProjects}
        onClose={handleCloseDetails}
        onNavigateToSlug={handleNavigateToSlug}
      />
    );
  }

  const webProjects = getFilteredWebProjects();
  const filteredGraphics = getFilteredGraphicsProjects();

  return (
    <section 
      id="projects" 
      className="mx-auto max-w-4xl px-4 py-8 sm:py-12 border-b border-neutral-200/60"
    >
      {/* Tab Selectors */}
      <div className="flex flex-col gap-6 mb-10" id="projects-filter-container">
        <div className="flex justify-between items-baseline border-b border-neutral-200 pb-4">
          <h2 
            id="projects-title"
            className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 uppercase"
          >
            My Creations
          </h2>
          <span className="font-mono text-xs text-neutral-400 font-bold" id="projects-count">
            Showing {activeCategory === "Web" ? webProjects.length : filteredGraphics.length} projects
          </span>
        </div>

        {/* Main Categories Tab */}
        <div className="flex gap-2" id="main-category-tabs">
          {(["Web", "Graphics"] as CategoryType[]).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-black text-white shadow-md"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 hover:text-black border border-neutral-200"
              }`}
            >
              {cat === "Web" ? "Web & AI Engineering" : "Graphics & Visual Design"}
            </button>
          ))}
        </div>

        {/* Graphics Subcategories & Search Filter */}
        {activeCategory === "Graphics" && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
            id="graphics-filters-panel"
          >
            {/* Subcategories Filter Row */}
            <div 
              className="flex flex-wrap gap-1.5 p-1.5 bg-neutral-100 rounded-2xl border border-neutral-200/60" 
              id="graphics-subcategory-tabs"
            >
              {(["All", "Graphic Design", "Branding", "Packaging Design", "Web Design"] as SubCategoryType[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubCategory(sub)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeSubCategory === sub
                      ? "bg-white text-black shadow-sm font-bold"
                      : "text-neutral-500 hover:text-black"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Instant Search Bar */}
            <div className="relative flex items-center" id="graphics-search-container">
              <Search size={14} className="absolute left-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search designs by title or tag (e.g. typography, sustainable, box)..."
                className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 hover:bg-neutral-100/30 focus:bg-white border border-neutral-200 focus:border-neutral-400 rounded-xl text-xs outline-none transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-[10px] font-mono text-neutral-400 hover:text-black font-bold cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Grid rendering Web vs Graphics */}
      <div 
        id="projects-grid"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {/* SKELETON STATE FOR DYNAMIC GRAPHICS LOADING */}
          {activeCategory === "Graphics" && isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="animate-pulse bg-white border border-neutral-150 rounded-2xl h-[340px] flex flex-col justify-between p-6"
              >
                <div className="space-y-4">
                  <div className="bg-neutral-200 h-40 rounded-xl w-full" />
                  <div className="bg-neutral-200 h-3 rounded w-1/4" />
                  <div className="bg-neutral-200 h-5 rounded w-3/4" />
                  <div className="bg-neutral-200 h-4 rounded w-full" />
                </div>
                <div className="flex gap-2 pt-4">
                  <div className="bg-neutral-200 h-4 rounded w-16" />
                  <div className="bg-neutral-200 h-4 rounded w-16" />
                </div>
              </div>
            ))
          ) : activeCategory === "Web" ? (
            /* Render original static Web projects exactly the same */
            webProjects.map((project, index) => (
              <motion.div
                key={project.title}
                id={`project-card-web-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 15 }}
                transition={{ duration: 0.3 }}
                className="card flex flex-col justify-between bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-neutral-300 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2" id={`project-card-title-container-${index}`}>
                    <div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest text-neutral-400">
                        {project.category}
                      </span>
                      <h3 
                        id={`project-card-title-${index}`}
                        className="font-sans text-base font-bold text-neutral-950 mt-0.5 group-hover:text-blue-600 transition-colors"
                      >
                        {project.title}
                      </h3>
                    </div>
                  </div>

                  <p 
                    id={`project-card-desc-${index}`}
                    className="mt-3 text-xs text-neutral-500 leading-relaxed font-sans"
                  >
                    {project.description}
                  </p>
                </div>

                <div>
                  <div 
                    id={`project-card-tags-${index}`}
                    className="mt-5 flex flex-wrap gap-1.5"
                  >
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        id={`project-tag-${index}-${tag}`}
                        className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] rounded-md font-medium font-sans"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* External links */}
                  {(project.liveUrl || project.githubUrl) && (
                    <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center gap-4" id={`project-card-links-${index}`}>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold tracking-wide transition-colors cursor-pointer font-sans"
                        >
                          <ExternalLink size={13} />
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors cursor-pointer font-sans"
                        >
                          <Github size={13} />
                          GitHub Repo
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : filteredGraphics.length === 0 ? (
            /* Empty state for search */
            <div className="col-span-full py-16 text-center bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl" id="empty-search-state">
              <span className="text-xl block mb-2">🔍</span>
              <p className="text-xs text-neutral-500 font-sans">No creative works match your search criteria.</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveSubCategory("All"); }}
                className="mt-3 text-xs text-blue-600 font-bold underline hover:text-blue-800"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Render beautifully optimized dynamic Graphics projects cards */
            filteredGraphics.map((project, index) => (
              <motion.div
                key={project.id}
                id={`project-card-graphics-${project.id}`}
                layout
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 15 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleNavigateToSlug(project.slug)}
                className="card group flex flex-col justify-between bg-white border border-neutral-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-neutral-300 transition-all overflow-hidden cursor-pointer"
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 border-b border-neutral-100">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle hover eye indicator */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full shadow text-[10px] font-bold text-neutral-800 flex items-center gap-1">
                      <Eye size={12} /> View Details
                    </div>
                  </div>
                  {project.featured && (
                    <div className="absolute top-3 left-3 bg-neutral-900/90 text-white text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded flex items-center gap-1 shadow-sm font-mono border border-white/10">
                      <Sparkles size={8} /> Featured
                    </div>
                  )}
                </div>

                {/* Card Information */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-neutral-400">
                      {project.category}
                    </span>
                    <h3 className="font-sans text-base font-bold text-neutral-950 mt-0.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-xs text-neutral-500 leading-relaxed font-sans line-clamp-2">
                      {project.short_description}
                    </p>
                  </div>

                  {/* Card Tags */}
                  <div className="mt-5 flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-neutral-50 border border-neutral-150 text-neutral-500 text-[9px] rounded font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

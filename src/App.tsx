import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ArrowRight, 
  Smile, 
  Briefcase, 
  Layers, 
  Sparkles, 
  Mail, 
  ArrowLeft, 
  Loader2, 
  Home,
  Lock
} from "lucide-react";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Fun from "./components/Fun";
import Contact from "./components/Contact";
import AIChatCompanion from "./components/AIChatCompanion";
import Admin from "./components/Admin";
import ParticlesBackground from "./components/ParticlesBackground";
import { profileData } from "./data/profile";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const suggestedSearches = [
  "How did training as a pastry chef help you?",
  "Tell me about your Prism DB project.",
  "What is your mechanical keyboard setup?",
  "What are your core engineering frameworks?",
];

export default function App() {
  const [view, setView] = useState<string>("home");
  const [profile, setProfile] = useState<any>(profileData);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMessages, setSearchMessages] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchResultsEndRef = useRef<HTMLDivElement>(null);

  // Fetch live profile from backend database
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    }
    fetchProfile();
  }, []);

  // Scroll to bottom of search chat logs
  useEffect(() => {
    if (view === "search") {
      searchResultsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchMessages, view]);

  // Listen to path or hash routing to handle /admin or #admin
  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === "/admin" || hash === "#admin") {
        setView("admin");
      } else if (path === "/" || hash === "#home" || hash === "") {
        if (view === "admin") {
          setView("home");
        }
      }
    };

    handleRouting();
    window.addEventListener("hashchange", handleRouting);
    window.addEventListener("popstate", handleRouting);
    return () => {
      window.removeEventListener("hashchange", handleRouting);
      window.removeEventListener("popstate", handleRouting);
    };
  }, [view]);

  const handleBackToHome = () => {
    window.history.pushState({}, "", "/");
    window.location.hash = "";
    setView("home");
  };

  // Handle submitting search query
  const handleSearchSubmit = async (queryText: string) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery) return;

    setSearchQuery(cleanQuery);
    setView("search");
    setSearchInput("");

    // Append user message to search log
    const newUserMsg: ChatMessage = { role: "user", content: cleanQuery };
    const updatedMessages = [...searchMessages, newUserMsg];
    setSearchMessages(updatedMessages);
    setIsSearching(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to search database.");
      }

      const data = await response.json();
      setSearchMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch (err) {
      console.error(err);
      setSearchMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble processing that search query. Could you try asking again?",
        },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search messages and start new search conversation
  const handleClearSearch = () => {
    setSearchMessages([]);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 selection:bg-neutral-900 selection:text-neutral-50" id="app-root">
      {/* Main Page Area */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8 sm:py-12" id="main-content">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative isolate flex flex-col items-center justify-center py-10 text-center"
              id="homepage-view"
            >
              {/* Aceternity Grid Background with Interactive Particles */}
              <div className="absolute inset-0 -z-10 overflow-hidden" id="aceternity-bg">
                <ParticlesBackground />
                <div className="absolute inset-0 bg-white/20 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_80%,transparent_100%)] pointer-events-none animate-pulse-slow" />
                <div className="absolute top-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-blue-400/5 blur-[90px] pointer-events-none animate-blob" />
                <div className="absolute top-[-5%] right-[-10%] h-[400px] w-[400px] rounded-full bg-purple-400/5 blur-[90px] pointer-events-none animate-blob animation-delay-2000" />
              </div>

              {/* Geometric Top Logo */}
              <div className="mb-6 flex justify-center" id="home-geom-logo">
                <svg className="w-12 h-12 text-black animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Greeting */}
              <div className="flex flex-col items-center mb-4" id="greeting-wrapper">
                <p id="home-greeting-top" className="font-mono text-xs sm:text-sm tracking-[0.3em] text-blue-600 font-bold uppercase mb-3">
                  HEY, I'M
                </p>
                <h2 id="home-greeting-name" className="font-serif text-5xl sm:text-6xl md:text-7xl font-normal text-neutral-900 tracking-tight leading-none">
                  {profile.name} <span className="inline-block animate-bounce origin-bottom">👋</span>
                </h2>
              </div>

              {/* Role Title */}
              <h1 id="home-role" className="font-sans text-xl sm:text-2xl md:text-3xl font-light text-neutral-500 tracking-wide leading-relaxed max-w-2xl mb-10">
                {profile.roleTitle}
              </h1>

              {/* Centered Photo */}
              <div className="relative mb-10 group" id="home-avatar-container">
                <img
                  id="home-avatar-img"
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="relative w-72 h-80 object-contain hover:scale-[1.03] transition-transform duration-500 ease-out"
                />
              </div>

              {/* Search Bar matching the sleek pattern */}
              <form
                id="home-search-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit(searchInput);
                }}
                className="w-full max-w-xl relative mb-12"
              >
                <div className="relative flex items-center">
                  <input
                    id="home-search-input"
                    type="text"
                    placeholder="Ask me anything about my projects, skills, or design style..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-full pl-6 pr-14 py-4 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 outline-none shadow-sm focus:border-neutral-400 focus:shadow-md transition-all font-sans"
                  />
                  <button
                    id="home-search-btn"
                    type="submit"
                    className="absolute right-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>

              {/* Navigation Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full max-w-3xl" id="home-nav-grid">
                {/* Me Card */}
                <button
                  id="home-card-me"
                  onClick={() => setView("me")}
                  className="aceternity-card flex flex-col items-center justify-center text-center p-5 cursor-pointer transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Smile size={18} />
                  </div>
                  <span className="font-display font-bold text-xs text-neutral-800">Me</span>
                </button>

                {/* Projects Card */}
                <button
                  id="home-card-projects"
                  onClick={() => setView("projects")}
                  className="aceternity-card flex flex-col items-center justify-center text-center p-5 cursor-pointer transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Briefcase size={18} />
                  </div>
                  <span className="font-display font-bold text-xs text-neutral-800">Projects</span>
                </button>

                {/* Skills Card */}
                <button
                  id="home-card-skills"
                  onClick={() => setView("skills")}
                  className="aceternity-card flex flex-col items-center justify-center text-center p-5 cursor-pointer transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Layers size={18} />
                  </div>
                  <span className="font-display font-bold text-xs text-neutral-800">Skills</span>
                </button>

                {/* Fun Card */}
                <button
                  id="home-card-fun"
                  onClick={() => setView("fun")}
                  className="aceternity-card flex flex-col items-center justify-center text-center p-5 cursor-pointer transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Sparkles size={18} />
                  </div>
                  <span className="font-display font-bold text-xs text-neutral-800">Fun Log</span>
                </button>

                {/* Contact Card */}
                <button
                  id="home-card-contact"
                  onClick={() => setView("contact")}
                  className="aceternity-card flex flex-col items-center justify-center text-center p-5 cursor-pointer transition-all group col-span-2 sm:col-span-1"
                >
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Mail size={18} />
                  </div>
                  <span className="font-display font-bold text-xs text-neutral-800">Contact</span>
                </button>
              </div>
            </motion.div>
          )}

          {view === "me" && (
            <motion.div
              key="me-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              id="me-view"
            >
              <div className="mb-6 flex justify-between items-center">
                <button
                  onClick={() => setView("home")}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Home
                </button>
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Profile Info</span>
              </div>
              <Hero setView={setView} profile={profile} />
            </motion.div>
          )}

          {view === "projects" && (
            <motion.div
              key="projects-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              id="projects-view"
            >
              <div className="mb-6 flex justify-between items-center">
                <button
                  onClick={() => setView("home")}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Home
                </button>
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Portfolio</span>
              </div>
              <Projects profile={profile} />
            </motion.div>
          )}

          {view === "skills" && (
            <motion.div
              key="skills-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              id="skills-view"
            >
              <div className="mb-6 flex justify-between items-center">
                <button
                  onClick={() => setView("home")}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Home
                </button>
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Toolchain</span>
              </div>
              <Skills profile={profile} />
            </motion.div>
          )}

          {view === "fun" && (
            <motion.div
              key="fun-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              id="fun-view"
            >
              <div className="mb-6 flex justify-between items-center">
                <button
                  onClick={() => setView("home")}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Home
                </button>
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Analog Logs</span>
              </div>
              <Fun profile={profile} />
            </motion.div>
          )}

          {view === "contact" && (
            <motion.div
              key="contact-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              id="contact-view"
            >
              <div className="mb-6 flex justify-between items-center">
                <button
                  onClick={() => setView("home")}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Home
                </button>
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Say Hello</span>
              </div>
              <Contact profile={profile} />
            </motion.div>
          )}

          {view === "search" && (
            <motion.div
              key="search-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
              id="search-view"
            >
              {/* Back to home / clear search */}
              <div className="mb-8 flex justify-between items-center" id="search-controls">
                <button
                  onClick={() => setView("home")}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Go Back Home
                </button>
                <button
                  onClick={handleClearSearch}
                  className="text-xs text-neutral-400 hover:text-red-500 transition-colors font-medium font-sans cursor-pointer"
                >
                  Reset Chat
                </button>
              </div>

              {/* Title Header */}
              <div className="mb-6" id="search-title-header">
                <h2 className="font-display text-xs uppercase tracking-widest text-neutral-400 font-bold mb-1">
                  AI Explorer Search
                </h2>
                <h1 className="font-display text-xl sm:text-2xl font-extrabold text-neutral-900">
                  Asking about: <span className="text-blue-600">"{searchQuery}"</span>
                </h1>
              </div>

              {/* Chat Session Area */}
              <div className="card shadow-md space-y-4 mb-8 bg-white p-6" id="search-chat-container">
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2" id="search-messages-log">
                  {searchMessages.map((msg, index) => {
                    const isAssistant = msg.role === "assistant";
                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-3 ${!isAssistant ? "justify-end" : "justify-start"}`}
                      >
                        {isAssistant && (
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs shrink-0 shadow-sm mt-1">
                            🤖
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-[18px] p-4 text-xs leading-relaxed font-sans ${
                            isAssistant
                              ? "bg-neutral-50 text-neutral-800 border border-neutral-150"
                              : "bg-neutral-900 text-white"
                          }`}
                        >
                          <p className="whitespace-pre-line font-sans">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {isSearching && (
                    <div className="flex items-start gap-3 justify-start" id="search-loading-message">
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs shrink-0 shadow-sm mt-1">
                        🤖
                      </div>
                      <div className="bg-neutral-50 border border-neutral-150 rounded-[18px] p-4 text-xs text-neutral-500 flex items-center gap-2 font-sans">
                        <Loader2 size={12} className="animate-spin text-blue-500" />
                        <span>Searching database & writing response...</span>
                      </div>
                    </div>
                  )}
                  <div ref={searchResultsEndRef} />
                </div>

                {/* Sub-search input inside search view */}
                <form
                  id="sub-search-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchInput.trim()) {
                      handleSearchSubmit(searchInput);
                    }
                  }}
                  className="relative pt-4 border-t border-neutral-100"
                >
                  <input
                    id="sub-search-input"
                    type="text"
                    placeholder="Ask another question..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    disabled={isSearching}
                    className="w-full text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-full pl-5 pr-14 py-3.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                  />
                  <div className="absolute right-3 top-[23px]">
                    <button
                      id="sub-search-btn"
                      type="submit"
                      disabled={!searchInput.trim() || isSearching}
                      className="w-8 h-8 bg-black hover:bg-neutral-800 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Suggestions Panel */}
              <div className="bg-neutral-100/50 rounded-2xl p-6 border border-neutral-200/60" id="search-suggestions-box">
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-3 font-display">
                  Explore other categories
                </h3>
                <div className="flex flex-wrap gap-2" id="search-suggestion-chips">
                  {suggestedSearches.map((sq, i) => (
                    <button
                      key={i}
                      id={`suggested-search-btn-${i}`}
                      onClick={() => handleSearchSubmit(sq)}
                      className="text-xs font-sans px-3 py-1.5 bg-white border border-neutral-200 rounded-full hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {view === "admin" && (
            <motion.div
              key="admin-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              id="admin-view"
            >
              <Admin onBack={handleBackToHome} profile={profile} onUpdateProfile={(updated: any) => setProfile(updated)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer with testing Admin ingress link */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 border-t border-neutral-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-sans mt-auto" id="app-footer">
        <div>
          © {new Date().getFullYear()} {profile?.name || "Dipesh"}. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setView("admin");
              window.history.pushState({}, "", "/admin");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-all font-mono font-bold tracking-wider text-[10px] shadow-xs cursor-pointer"
            id="admin-testing-ingress-btn"
          >
            <Lock size={11} className="text-neutral-400" />
            ADMIN CMS PANEL (TESTING)
          </button>
        </div>
      </footer>

      {/* Floating Grounded AI Avatar Chat */}
      <AIChatCompanion profile={profile} />
    </div>
  );
}

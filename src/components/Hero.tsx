import { MapPin } from "lucide-react";
import { motion } from "motion/react";
import { profileData, ProfileData } from "../data/profile";

interface HeroProps {
  setView?: (view: string) => void;
  profile?: ProfileData;
}

export default function Hero({ setView, profile }: HeroProps) {
  const p = profile || profileData;
  return (
    <section 
      id="me" 
      className="mx-auto max-w-4xl px-6 py-20 md:py-28 flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16 border-b border-neutral-200/60"
    >
      {/* Avatar Container */}
      <motion.div 
        id="hero-avatar-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative flex-shrink-0"
      >
        <div className="relative h-32 w-32 md:h-40 md:w-40 overflow-hidden rounded-full border border-neutral-200/80 bg-neutral-100 p-1 shadow-sm">
          <img 
            id="hero-avatar"
            src={p.avatarUrl} 
            alt={p.name} 
            className="h-full w-full rounded-full object-cover grayscale-[10%]"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Playful subtle status dot */}
        <div className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-neutral-50 bg-green-500 animate-pulse shadow-sm" id="hero-status-dot" title="Available for projects" />
      </motion.div>

      {/* Hero Content */}
      <motion.div 
        id="hero-content"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="flex-col text-center md:text-left flex items-center md:items-start"
      >
        {/* Location Badge */}
        <div 
          id="hero-location"
          className="inline-flex items-center gap-1.5 skill-chip mb-6"
        >
          <MapPin size={10} className="text-neutral-500" />
          <span className="font-sans font-medium text-[10px]">{p.location}</span>
        </div>

        {/* Greetings */}
        <h1 
          id="hero-greeting"
          className="font-display text-sm font-bold tracking-widest text-neutral-400 uppercase mb-2"
        >
          Hey, I'm {p.name} 👋
        </h1>

        {/* Role */}
        <h2 
          id="hero-role"
          className="mt-2 font-display text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight"
        >
          {p.roleTitle}
        </h2>

        {/* Short Bio */}
        <p 
          id="hero-bio"
          className="mt-6 text-sm md:text-base text-neutral-500 leading-relaxed max-w-xl font-sans"
        >
          {p.bio}
        </p>

        {/* Dynamic call to action */}
        <div className="mt-8 flex gap-3" id="hero-actions">
          <button
            onClick={() => {
              if (setView) {
                setView("contact");
              } else {
                const element = document.getElementById("contact");
                element?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="px-5 py-3 rounded-xl border border-black bg-black text-[11px] font-bold text-white hover:bg-neutral-800 transition-colors cursor-pointer uppercase tracking-wider"
            id="hero-cta-contact"
          >
            Let's build together
          </button>
          <button
            onClick={() => {
              if (setView) {
                setView("projects");
              } else {
                const element = document.getElementById("projects");
                element?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="px-5 py-3 rounded-xl border border-neutral-200 bg-white text-[11px] font-bold text-black hover:bg-neutral-50 transition-colors cursor-pointer uppercase tracking-wider"
            id="hero-cta-projects"
          >
            Explore Projects
          </button>
        </div>
      </motion.div>
    </section>
  );
}

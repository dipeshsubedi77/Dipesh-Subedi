import { Mail, Github, Linkedin, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { profileData, ProfileData } from "../data/profile";

interface ContactProps {
  profile?: ProfileData;
}

export default function Contact({ profile }: ContactProps) {
  const p = profile || profileData;
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section 
      id="contact" 
      className="mx-auto max-w-4xl px-6 py-20 pb-32 flex flex-col items-center text-center"
    >
      <motion.div
        id="contact-card"
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full rounded-[20px] bg-neutral-900 text-white p-10 md:p-14 border border-neutral-850 shadow-xl"
      >
        {/* Headline CTA */}
        <h2 
          id="contact-headline"
          className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-white"
        >
          {p.contact.headline}
        </h2>

        {/* Context */}
        <p 
          id="contact-context"
          className="mx-auto mt-4 max-w-md text-xs md:text-sm text-neutral-400 leading-relaxed font-sans"
        >
          {p.contact.context}
        </p>

        {/* Low-friction Email Trigger */}
        <div className="mt-8 flex justify-center" id="contact-button-container">
          <a
            id="contact-email-btn"
            href={`mailto:${p.contact.email}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white text-black hover:bg-neutral-100 px-6 py-3 text-xs font-bold transition-colors cursor-pointer"
          >
            <Mail size={14} />
            <span>SEND EMAIL</span>
          </a>
        </div>

        {/* Social Links */}
        <div className="mt-8 flex justify-center items-center gap-6 text-neutral-400" id="contact-socials">
          {p.contact.github && (
            <a
              id="contact-social-github"
              href={p.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5 text-xs"
            >
              <Github size={14} />
              <span className="font-medium">GitHub</span>
            </a>
          )}
          {p.contact.linkedin && (
            <a
              id="contact-social-linkedin"
              href={p.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5 text-xs"
            >
              <Linkedin size={14} />
              <span className="font-medium">LinkedIn</span>
            </a>
          )}
        </div>
      </motion.div>

      {/* Footer copyright and Back-to-Top */}
      <div className="mt-16 w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-400 border-t border-neutral-200/50 pt-8" id="footer-container">
        <p className="text-xs font-mono" id="footer-text">
          &copy; {new Date().getFullYear()} {p.name}. All rights reserved.
        </p>
        <button
          id="footer-back-to-top"
          onClick={handleScrollToTop}
          className="inline-flex items-center gap-1 text-xs font-medium hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <span>Back to top</span>
          <ArrowUpRight size={12} />
        </button>
      </div>
    </section>
  );
}

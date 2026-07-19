import { Briefcase } from "lucide-react";
import { motion } from "motion/react";
import { profileData, ProfileData } from "../data/profile";

interface SkillsProps {
  profile?: ProfileData;
}

export default function Skills({ profile }: SkillsProps) {
  const p = profile || profileData;
  const skills = p?.skills || profileData.skills || [];
  const experience = p?.experience || profileData.experience || [];
  return (
    <section 
      id="skills" 
      className="mx-auto max-w-4xl px-6 py-20 border-b border-neutral-200/60"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Skills Tag Cloud Card */}
        <div className="md:col-span-1" id="skills-tags-container">
          <div className="card h-full flex flex-col justify-between">
            <div>
              <h2 
                id="skills-title"
                className="font-display text-xs uppercase tracking-widest text-neutral-400 font-bold mb-4"
              >
                Key Skills
              </h2>
              <p className="text-xs text-neutral-500 mb-6 leading-relaxed" id="skills-intro">
                Primary tools, frameworks, and deep methodologies driving my daily development workflow.
              </p>
            </div>

            <div className="flex flex-wrap gap-2" id="skills-tag-cloud">
              {skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  id={`skill-tag-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="skill-chip cursor-default"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Columns: Experience Blocks Card */}
        <div className="md:col-span-2" id="skills-experience-container">
          <div className="card h-full">
            <h2 
              id="experience-title"
              className="font-display text-xs uppercase tracking-widest text-neutral-400 font-bold mb-6 flex items-center gap-2"
            >
              <Briefcase size={14} className="text-neutral-400" />
              <span>Work Log</span>
            </h2>

            <div className="space-y-8 relative pl-4 border-l border-neutral-200" id="experience-list">
              {experience.map((exp, index) => (
                <motion.div
                  key={`${exp.company}-${exp.role}`}
                  id={`experience-item-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-neutral-300 bg-white" id={`experience-dot-${index}`} />

                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1" id={`experience-header-${index}`}>
                    <h3 
                      id={`experience-role-${index}`}
                      className="font-display text-sm font-bold text-neutral-900"
                    >
                      {exp.role}
                    </h3>
                    <span 
                      id={`experience-period-${index}`}
                      className="font-mono text-[10px] text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100 w-fit font-medium"
                    >
                      {exp.period}
                    </span>
                  </div>

                  <div 
                    id={`experience-company-${index}`}
                    className="text-xs font-semibold text-neutral-600 mt-1"
                  >
                    {exp.company}
                  </div>

                  <p 
                    id={`experience-desc-${index}`}
                    className="mt-2 text-xs text-neutral-500 leading-relaxed font-sans"
                  >
                    {exp.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

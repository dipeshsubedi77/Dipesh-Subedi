export interface Project {
  title: string;
  description: string;
  tags: string[];
  category: "Web" | "Graphics";
  subCategory?: "Graphic Design" | "Branding" | "Packaging Design" | "Web Design";
  liveUrl?: string;
  githubUrl?: string;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface FunFact {
  title: string;
  value: string;
  category: string;
  image?: string;
  uid?: string;
  tiktokUrl?: string;
}

export interface ProfileData {
  name: string;
  roleTitle: string;
  bio: string;
  location: string;
  avatarUrl: string;
  skills: string[];
  projects: Project[];
  experience: Experience[];
  funFacts: FunFact[];
  contact: {
    headline: string;
    context: string;
    email: string;
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export const profileData: ProfileData = {
  name: "Dipesh",
  roleTitle: "Graphics Designer & AI Engineer",
  location: "San Francisco, CA 📍",
  avatarUrl: "/images/avatar.jpg",
  bio: "Combining aesthetic vision with neural network structures. I design premium visual identities, layouts, and packagings while coding client-side intelligence and vector models.",
  skills: [
    "Figma", "Adobe Illustrator", "Photoshop", "Branding & Identity", "Packaging Design",
    "TypeScript", "React", "Python", "TensorFlow", "PyTorch", "Tailwind CSS", "WebGPU"
  ],
  projects: [
    {
      title: "AI Conversational Portfolio",
      description: "A customized AI-powered responsive companion search agent that guides visitors through my works and designs using natural language. Fast, intelligent, and beautifully animated.",
      tags: ["React", "Tailwind CSS", "Gemini SDK", "Vite"],
      category: "Web",
      liveUrl: "https://ais-pre-tbvj4bnam5ljjzgnmokf4f-207152665847.asia-southeast1.run.app",
      githubUrl: "https://github.com/dondipesh/ai-portfolio-companion"
    },
    {
      title: "Prism Vector DB Explorer",
      description: "A highly visual in-memory vector index explorer running on HNSW search structures. Visualizes word embedding high-dimensional clusters inside web browsers.",
      tags: ["TypeScript", "D3.js", "React", "Vector Embeddings"],
      category: "Web",
      liveUrl: "https://prism-vector-db.vercel.app",
      githubUrl: "https://github.com/dondipesh/prism-vector-db"
    },
    {
      title: "Aura Breath Loop System",
      description: "Interactive biofeedback audio synthesizer web application. Captures real-time breathing rates to procedurally paint generative gradient landscapes.",
      tags: ["Web Audio API", "React", "Tailwind CSS", "Motion"],
      category: "Web",
      liveUrl: "https://aura-breath.vercel.app",
      githubUrl: "https://github.com/dondipesh/aura-breath"
    },
    {
      title: "Swiss Typographic Poster Series",
      description: "A minimal poster editorial set celebrating grid systems, extreme high-contrast asymmetrical layouts, and absolute white spaces in Helvetica Neue.",
      tags: ["Typography", "Grid Systems", "Print Design"],
      category: "Graphics",
      subCategory: "Graphic Design",
      liveUrl: "https://www.behance.net/gallery/swiss-style-posters",
      githubUrl: "https://github.com/dondipesh/swiss-posters"
    },
    {
      title: "Kanso Organic Tea Identity",
      description: "Full brand strategy, logo guidelines, type hierarchy, and visual design assets for a high-end organic matcha brand targeting mindful lifestyle seekers.",
      tags: ["Branding", "Vector Design", "Logo Design"],
      category: "Graphics",
      subCategory: "Branding",
      liveUrl: "https://www.behance.net/gallery/kanso-tea-identity",
      githubUrl: "https://github.com/dondipesh/kanso-branding"
    },
    {
      title: "Noir Coffee Brew Package",
      description: "Sustainable cold brew custom box diecut design, vector wrap patterns, and tactile typography layout built using biodegradable material presets.",
      tags: ["Packaging", "Diecut Pattern", "Industrial Design"],
      category: "Graphics",
      subCategory: "Packaging Design",
      liveUrl: "https://www.behance.net/gallery/noir-coffee-packaging",
      githubUrl: "https://github.com/dondipesh/noir-packaging"
    },
    {
      title: "Ethereal Retail Interface Design",
      description: "Artistic, highly editorial retail desktop layout prototype leveraging elegant serif displays, generous margins, and subtle micro-interactions.",
      tags: ["Web Design", "UI Design", "Figma", "Framer"],
      category: "Graphics",
      subCategory: "Web Design",
      liveUrl: "https://ethereal-store-ui.vercel.app",
      githubUrl: "https://github.com/dondipesh/ethereal-ui"
    }
  ],
  experience: [
    {
      role: "Lead AI Engineer",
      company: "Synthetica Lab",
      period: "2024 - Present",
      description: "Pioneering browser-native agent runtimes and optimizing small language models (SLMs) for low-latency client environments using WebGPU."
    },
    {
      role: "Full-Stack Developer",
      company: "Vapor Tech",
      period: "2022 - 2024",
      description: "Built real-time canvas architectures and integrated multi-modal AI systems for collaborative design and document editors."
    },
    {
      role: "Interactive Systems Developer",
      company: "Helix Studio",
      period: "2020 - 2022",
      description: "Designed and developed responsive creative tools, high-performance interactive experiences, and custom physics simulation environments."
    }
  ],
  funFacts: [
    {
      category: "CREATIVE TOOLKIT 💻",
      title: "My Design Stack",
      value: "I create modern visual identities and digital experiences using Adobe Photoshop, Illustrator, Figma, After Effects, and AI-powered creative tools. I enjoy combining minimalism with bold visual storytelling."
    },
    {
      category: "DESIGN PHILOSOPHY 🎨",
      title: "Less, But Better",
      value: "I believe great design is simple, functional, and memorable. Every project starts with understanding the problem before creating clean, impactful visual solutions that communicate effectively."
    },
    {
      category: "PERSONAL ROUTINE 🌅",
      title: "Consistency Over Motivation",
      value: "I value discipline, continuous learning, and daily improvement. Whether I'm designing, learning a new skill, or exploring AI, I focus on building long-term consistency rather than short bursts of motivation."
    },
    {
      category: "GAMING 🎮",
      title: "Competitive Free Fire Player",
      value: "Gaming has strengthened my strategic thinking, teamwork, and quick decision-making. I enjoy competitive squad matches and constantly improving my gameplay while balancing creativity and productivity.",
      uid: "949629390",
      image: "/src/assets/images/freefire_profile_avatar_1784433622071.jpg",
      tiktokUrl: "https://www.tiktok.com/@dondipesh897"
    },
    {
      category: "CURRENTLY LEARNING 🚀",
      title: "AI & Motion Design",
      value: "I'm currently expanding my skills in AI-assisted design, motion graphics, 3D branding, modern web interactions, and immersive user experiences to stay ahead of industry trends."
    },
    {
      category: "WORKSPACE ⚡",
      title: "Minimal Creative Setup",
      value: "A clean and distraction-free workspace helps me stay focused. My setup is optimized for design, coding, productivity, and creative experimentation with modern hardware and software."
    }
  ],
  contact: {
    headline: "Let's build something beautiful.",
    context: "Have a project in mind, want to discuss small language model optimizations, or just want to swap your favorite sourdough/pastry recipe? Drop me a line.",
    email: "dondipesh897@gmail.com",
    github: "https://github.com/dondipesh",
    linkedin: "https://linkedin.com/in/dondipesh"
  }
};

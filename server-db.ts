import fs from "fs";
import path from "path";

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

const DB_PATH = path.join(process.cwd(), "projects-db.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Seed data
const SEED_PROJECTS: ProjectCMS[] = [
  {
    id: "seed-swiss-poster",
    title: "Swiss Typographic Poster Series",
    slug: "swiss-typographic-poster-series",
    short_description: "A minimal poster editorial set celebrating grid systems, extreme high-contrast asymmetrical layouts, and absolute white spaces in Helvetica Neue.",
    description: "This poster series is an exploration of Swiss International Typographic Style. Leveraging strict modular grid systems, dramatic scale contrasts, and asymmetrical layouts, each design celebrates the pure aesthetic power of black and white spaces paired with clean Helvetica Neue type. The project emphasizes the design rule that 'less is more' and visual order creates seamless communication.",
    category: "Graphic Design",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Typography", "Grid Systems", "Print Design"],
    software_used: ["Adobe Illustrator", "InDesign"],
    client: "Basel Museum of Design",
    completion_date: "2024-04",
    project_url: "",
    featured: true,
    status: "Published",
    display_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "seed-kanso-tea",
    title: "Kanso Organic Tea Identity",
    slug: "kanso-organic-tea-identity",
    short_description: "Full brand strategy, logo guidelines, type hierarchy, and visual design assets for a high-end organic matcha brand targeting mindful lifestyle seekers.",
    description: "Kanso is an organic ceremonial matcha brand. The branding represents 'simplicity' (Kanso) through a clean, minimal logo, a serene color palette of forest greens and soft warm stones, and elegant layout grids. We crafted everything from the primary logomark to visual identity guidelines, print collateral, and retail experience packaging prototypes.",
    category: "Branding",
    thumbnail: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1531224169555-d4190c1e85ee?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Branding", "Vector Design", "Logo Design"],
    software_used: ["Adobe Illustrator", "Photoshop", "Figma"],
    client: "Kanso Organic Inc.",
    completion_date: "2024-05",
    project_url: "",
    featured: true,
    status: "Published",
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "seed-noir-coffee",
    title: "Noir Coffee Brew Package",
    slug: "noir-coffee-brew-package",
    short_description: "Sustainable cold brew custom box diecut design, vector wrap patterns, and tactile typography layout built using biodegradable material presets.",
    description: "Noir Coffee Brew represents sustainable premium beverage packaging. We created a custom box diecut with an integrated carrying handle, minimalist typographic labeling, and subtle vector texture wraps. The materials are fully compostable, utilizing organic soy inks, yet retaining an ultra-luxurious, tactile feel that commands presence on the shelf.",
    category: "Packaging Design",
    thumbnail: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Packaging", "Diecut Pattern", "Industrial Design"],
    software_used: ["Adobe Illustrator", "Dimension"],
    client: "Noir Coffee Roasters",
    completion_date: "2024-06",
    project_url: "",
    featured: true,
    status: "Published",
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "seed-ethereal-retail",
    title: "Ethereal Retail Interface Design",
    slug: "ethereal-retail-interface-design",
    short_description: "Artistic, highly editorial retail desktop layout prototype leveraging elegant serif displays, generous margins, and subtle micro-interactions.",
    description: "Ethereal is a luxury fashion retail web interface concept. It combines experimental asymmetric grid layouts, elegant high-contrast editorial typography, and oversized image sections. The prototype is fully responsive and focuses on interactive micro-animations (e.g. smooth image transitions, minimalist shopping carts) to make the retail browsing feel like an art magazine.",
    category: "Web Design",
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["Web Design", "UI Design", "Figma", "Framer"],
    software_used: ["Figma", "React", "Tailwind CSS"],
    client: "Ethereal Haute Couture",
    completion_date: "2024-07",
    project_url: "https://ethereal-store-ui.vercel.app",
    featured: true,
    status: "Published",
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Read database
export function readDB(): ProjectCMS[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(SEED_PROJECTS, null, 2), "utf-8");
      return SEED_PROJECTS;
    }
    const content = fs.readFileSync(DB_PATH, "utf-8");
    if (!content.trim()) {
      fs.writeFileSync(DB_PATH, JSON.stringify(SEED_PROJECTS, null, 2), "utf-8");
      return SEED_PROJECTS;
    }
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading projects-db.json:", error);
    return SEED_PROJECTS;
  }
}

// Write database
export function writeDB(projects: ProjectCMS[]): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(projects, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing projects-db.json:", error);
  }
}

// Save binary image file from Base64 Data URL
export function saveBase64Image(base64DataUrl: string, prefix: string = "img"): string {
  // e.g. "data:image/webp;base64,UklGRv..."
  const matches = base64DataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image data format");
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");

  // Determine file extension
  let extension = "png";
  if (mimeType.includes("webp")) extension = "webp";
  else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) extension = "jpg";
  else if (mimeType.includes("gif")) extension = "gif";

  const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${extension}`;
  const filepath = path.join(UPLOADS_DIR, filename);

  fs.writeFileSync(filepath, buffer);
  return `/uploads/${filename}`;
}

// Read profile database
export function readProfileDB(fallback: any): any {
  const PROFILE_DB_PATH = path.join(process.cwd(), "profile-db.json");
  try {
    if (!fs.existsSync(PROFILE_DB_PATH)) {
      fs.writeFileSync(PROFILE_DB_PATH, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
    const content = fs.readFileSync(PROFILE_DB_PATH, "utf-8");
    if (!content.trim()) {
      fs.writeFileSync(PROFILE_DB_PATH, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
    let parsed = JSON.parse(content);
    if (parsed && parsed.profile && typeof parsed.profile === "object" && parsed.profile.name) {
      parsed = parsed.profile;
      try {
        fs.writeFileSync(PROFILE_DB_PATH, JSON.stringify(parsed, null, 2), "utf-8");
      } catch (e) {
        console.error("Error auto-flattening profile-db.json:", e);
      }
    }
    return parsed;
  } catch (error) {
    console.error("Error reading profile-db.json:", error);
    return fallback;
  }
}

// Write profile database
export function writeProfileDB(profile: any): void {
  const PROFILE_DB_PATH = path.join(process.cwd(), "profile-db.json");
  try {
    fs.writeFileSync(PROFILE_DB_PATH, JSON.stringify(profile, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing profile-db.json:", error);
  }
}


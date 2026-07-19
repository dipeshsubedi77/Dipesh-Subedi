import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { profileData } from "./src/data/profile";
import { readDB, writeDB, saveBase64Image, ProjectCMS, readProfileDB, writeProfileDB } from "./server-db";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "dipesh_admin_secret_token_session";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Admin features are now always accessible with the default password if ADMIN_PASSWORD is not set.

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Ensure NODE_ENV is set for production
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

  // Increase payload limit for base64 image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Serve uploads directory as a static folder
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Admin authorization middleware
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (authHeader === `Bearer ${ADMIN_TOKEN}`) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized access" });
    }
  };

  // Helper to parse base64 images inside a project and convert to file paths
  const processProjectImages = (projectData: Partial<ProjectCMS>): Partial<ProjectCMS> => {
    const p = { ...projectData };
    if (p.thumbnail && p.thumbnail.startsWith("data:image")) {
      p.thumbnail = saveBase64Image(p.thumbnail, "thumb");
    }
    if (p.gallery && Array.isArray(p.gallery)) {
      p.gallery = p.gallery.map((img, i) => {
        if (img.startsWith("data:image")) {
          return saveBase64Image(img, `gal_${i}`);
        }
        return img;
      });
    }
    return p;
  };

  // API Route for Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (!ADMIN_PASSWORD) {
      return res.status(500).json({ error: "Admin login not configured" });
    }
    if (password === ADMIN_PASSWORD) {
      res.json({ token: ADMIN_TOKEN });
    } else {
      res.status(401).json({ error: "Invalid admin password" });
    }
  });

  // Public endpoint for profile details
  app.get("/api/profile", (req, res) => {
    try {
      const data = readProfileDB(profileData);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: Update entire profile details (skills, experience, contact, etc)
  app.put("/api/admin/profile", requireAdmin, (req, res) => {
    try {
      const updatedProfile = req.body;
      
      // Handle base64 avatar image upload if present
      if (updatedProfile.avatarUrl && updatedProfile.avatarUrl.startsWith("data:image")) {
        updatedProfile.avatarUrl = saveBase64Image(updatedProfile.avatarUrl, "avatar");
      }
      
      // Handle base64 images inside funFacts if any
      if (updatedProfile.funFacts && Array.isArray(updatedProfile.funFacts)) {
        updatedProfile.funFacts = updatedProfile.funFacts.map((fact: any, i: number) => {
          if (fact.image && fact.image.startsWith("data:image")) {
            fact.image = saveBase64Image(fact.image, `fun_fact_${i}`);
          }
          return fact;
        });
      }

      writeProfileDB(updatedProfile);
      res.json(updatedProfile);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Public endpoint for published graphics projects
  app.get("/api/graphics-projects", (req, res) => {
    try {
      const db = readDB();
      // Filter out drafts for public view, sort by display_order
      const published = db
        .filter((p) => p.status === "Published")
        .sort((a, b) => a.display_order - b.display_order);
      res.json(published);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: List all projects (published + draft)
  app.get("/api/admin/graphics-projects", requireAdmin, (req, res) => {
    try {
      const db = readDB();
      const sorted = db.sort((a, b) => a.display_order - b.display_order);
      res.json(sorted);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: Add a project
  app.post("/api/admin/graphics-projects", requireAdmin, (req, res) => {
    try {
      const db = readDB();
      const rawProject = req.body;
      
      const processed = processProjectImages(rawProject);
      
      const newProject: ProjectCMS = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: processed.title || "Untitled Project",
        slug: processed.slug || "untitled",
        short_description: processed.short_description || "",
        description: processed.description || "",
        category: processed.category || "Graphic Design",
        thumbnail: processed.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        gallery: processed.gallery || [],
        tags: processed.tags || [],
        software_used: processed.software_used || [],
        client: processed.client || "",
        completion_date: processed.completion_date || "",
        project_url: processed.project_url || "",
        featured: !!processed.featured,
        status: processed.status || "Draft",
        display_order: typeof processed.display_order === "number" ? processed.display_order : db.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.push(newProject);
      writeDB(db);
      res.status(201).json(newProject);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: Update a project
  app.put("/api/admin/graphics-projects/:id", requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const db = readDB();
      const index = db.findIndex((p) => p.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: "Project not found" });
      }

      const rawProject = req.body;
      const processed = processProjectImages(rawProject);

      const existing = db[index];
      const updatedProject: ProjectCMS = {
        ...existing,
        title: processed.title ?? existing.title,
        slug: processed.slug ?? existing.slug,
        short_description: processed.short_description ?? existing.short_description,
        description: processed.description ?? existing.description,
        category: processed.category ?? existing.category,
        thumbnail: processed.thumbnail ?? existing.thumbnail,
        gallery: processed.gallery ?? existing.gallery,
        tags: processed.tags ?? existing.tags,
        software_used: processed.software_used ?? existing.software_used,
        client: processed.client ?? existing.client,
        completion_date: processed.completion_date ?? existing.completion_date,
        project_url: processed.project_url ?? existing.project_url,
        featured: processed.featured !== undefined ? !!processed.featured : existing.featured,
        status: processed.status ?? existing.status,
        display_order: typeof processed.display_order === "number" ? processed.display_order : existing.display_order,
        updated_at: new Date().toISOString()
      };

      db[index] = updatedProject;
      writeDB(db);
      res.json(updatedProject);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: Delete a project
  app.delete("/api/admin/graphics-projects/:id", requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const db = readDB();
      const filtered = db.filter((p) => p.id !== id);
      if (filtered.length === db.length) {
        return res.status(404).json({ error: "Project not found" });
      }
      writeDB(filtered);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: Bulk Reorder projects
  app.post("/api/admin/reorder", requireAdmin, (req, res) => {
    try {
      const { orders } = req.body; // e.g. { "id1": 0, "id2": 1, ... }
      if (!orders || typeof orders !== "object") {
        return res.status(400).json({ error: "Invalid orders object" });
      }

      const db = readDB();
      db.forEach((project) => {
        if (project.id in orders) {
          project.display_order = orders[project.id];
          project.updated_at = new Date().toISOString();
        }
      });

      writeDB(db);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Route for grounded AI chat
  app.post("/api/chat", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({
        apiKey: apiKey || "MOCK_KEY", // fallback to prevent startup crash if missing
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages array" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({ 
          content: "Hi! I'm Alex's AI companion. Note that the **GEMINI_API_KEY** is currently not configured in the environment. Please add it via **Settings > Secrets** in AI Studio to enable my dynamic intelligence!" 
        });
      }

      // Convert messages to Gemini format
      const geminiContents = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      // Set up the system instruction incorporating the profile data
      const currentProfile = readProfileDB(profileData);
      const systemInstruction = `
You are the interactive AI avatar of ${currentProfile.name}, a professional ${currentProfile.roleTitle}.
You are grounded in the following verified profile data about ${currentProfile.name}:

${JSON.stringify(currentProfile, null, 2)}

Strict Guidelines:
1. Speak in the first-person ("I", "my", "me") because you represent ${currentProfile.name}'s personal virtual avatar.
2. Be friendly, authentic, intelligent, and casual. Keep a warm, professional developer persona.
3. Keep answers concise, highly readable, and formatted with clean markdown (use short lists or bullet points).
4. Strictly answer based on the profile data. If asked about something you don't know or that is unrelated to ${currentProfile.name}'s background, politely state that you can only speak about ${currentProfile.name}'s engineering work, projects, and pastries, then steer back.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: geminiContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I am unable to generate a response at this moment.";
      res.json({ content: replyText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during chat processing." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

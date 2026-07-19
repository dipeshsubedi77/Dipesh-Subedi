import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Edit2, ArrowLeft, Upload, Sparkles, X, Check, 
  Lock, LayoutGrid, Eye, EyeOff, Star, ArrowUpDown, RefreshCw, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProjectCMS } from "./ProjectDetails";

interface AdminProps {
  onBack: () => void;
  profile?: any;
  onUpdateProfile?: (updated: any) => void;
}

// Utility to optimize images client-side using standard Canvas
function optimizeAndConvertToBase64(file: File, maxDim: number = 1200, quality: number = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while capping dimension
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string); // fallback to original base64
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Export as WebP or keep original mime type for compatibility and transparency
        const mimeType = file.type;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function Admin({ onBack, profile, onUpdateProfile }: AdminProps) {
  // Authentication states
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(localStorage.getItem("dipesh_admin_token"));
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Active view tab inside admin
  const [activeTab, setActiveTab] = useState<"projects" | "profile">("projects");

  // Profile CMS fields
  const [profName, setProfName] = useState("");
  const [profRoleTitle, setProfRoleTitle] = useState("");
  const [profLocation, setProfLocation] = useState("");
  const [profBio, setProfBio] = useState("");
  const [profAvatar, setProfAvatar] = useState("");

  const [profSkills, setProfSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [profExperiences, setProfExperiences] = useState<any[]>([]);
  // Experience subform states
  const [expIndex, setExpIndex] = useState<number | null>(null);
  const [expRole, setExpRole] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expPeriod, setExpPeriod] = useState("");
  const [expDesc, setExpDesc] = useState("");

  const [profFunFacts, setProfFunFacts] = useState<any[]>([]);
  // Fun facts subform states
  const [funIndex, setFunIndex] = useState<number | null>(null);
  const [funCategory, setFunCategory] = useState("CREATIVE TOOLKIT 💻");
  const [funTitle, setFunTitle] = useState("");
  const [funValue, setFunValue] = useState("");
  const [funUid, setFunUid] = useState("");
  const [funTiktokUrl, setFunTiktokUrl] = useState("");
  const [funImage, setFunImage] = useState("");

  const [profContactHeadline, setProfContactHeadline] = useState("");
  const [profContactContext, setProfContactContext] = useState("");
  const [profContactEmail, setProfContactEmail] = useState("");
  const [profContactGithub, setProfContactGithub] = useState("");
  const [profContactLinkedin, setProfContactLinkedin] = useState("");

  // Projects inventory
  const [projects, setProjects] = useState<ProjectCMS[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Active form operation
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Graphic Design" | "Branding" | "Packaging Design" | "Web Design">("Graphic Design");
  const [tagsInput, setTagsInput] = useState("");
  const [softwareInput, setSoftwareInput] = useState("");
  const [client, setClient] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"Published" | "Draft">("Published");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);

  // Drag and drop states for reordering
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Synchronize profile data with form states
  useEffect(() => {
    if (profile) {
      setProfName(profile.name || "");
      setProfRoleTitle(profile.roleTitle || "");
      setProfLocation(profile.location || "");
      setProfBio(profile.bio || "");
      setProfAvatar(profile.avatarUrl || "");
      setProfSkills(profile.skills || []);
      setProfExperiences(profile.experience || []);
      setProfFunFacts(profile.funFacts || []);
      if (profile.contact) {
        setProfContactHeadline(profile.contact.headline || "");
        setProfContactContext(profile.contact.context || "");
        setProfContactEmail(profile.contact.email || "");
        setProfContactGithub(profile.contact.github || "");
        setProfContactLinkedin(profile.contact.linkedin || "");
      }
    }
  }, [profile]);

  // Fetch projects on successful authentication
  useEffect(() => {
    if (token) {
      loadProjects();
    }
  }, [token]);

  // Handle title to slug generation automatically
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      // Slugify
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/graphics-projects", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401) {
        // Logout if token expired
        handleLogout();
        throw new Error("Session expired. Please login again.");
      }
      if (!res.ok) throw new Error("Could not load creations database");
      const data = await res.json();
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to save general profile object back to backend
  const handleSaveProfile = async (updatedFields: Partial<any>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      // Merge with existing profile data or build complete payload
      const payload = {
        ...profile,
        ...updatedFields
      };

      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ profile: payload })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update profile settings.");
      }

      const data = await res.json();
      setSuccess("Profile settings updated successfully!");
      if (onUpdateProfile) {
        onUpdateProfile(data.profile);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // General & Contact Save
  const handleSaveGeneralAndContact = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveProfile({
      name: profName.trim(),
      roleTitle: profRoleTitle.trim(),
      location: profLocation.trim(),
      bio: profBio.trim(),
      avatarUrl: profAvatar,
      contact: {
        headline: profContactHeadline.trim(),
        context: profContactContext.trim(),
        email: profContactEmail.trim(),
        github: profContactGithub.trim(),
        linkedin: profContactLinkedin.trim(),
      }
    });
  };

  // Avatar Upload handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setError(null);
        const base64 = await optimizeAndConvertToBase64(file);
        setProfAvatar(base64);
        // Save immediately for dynamic feed
        await handleSaveProfile({ avatarUrl: base64 });
      } catch (err: any) {
        setError("Error optimizing avatar: " + err.message);
      }
    }
  };

  // Skills handlers
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const cleanSkill = newSkill.trim();
    if (profSkills.includes(cleanSkill)) {
      setError("Skill already exists!");
      return;
    }
    const updated = [...profSkills, cleanSkill];
    setProfSkills(updated);
    setNewSkill("");
    await handleSaveProfile({ skills: updated });
  };

  const handleDeleteSkill = async (skillToDelete: string) => {
    const updated = profSkills.filter((s) => s !== skillToDelete);
    setProfSkills(updated);
    await handleSaveProfile({ skills: updated });
  };

  // Experience handlers
  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expRole.trim() || !expCompany.trim() || !expPeriod.trim() || !expDesc.trim()) {
      setError("Please fill in all Experience fields.");
      return;
    }

    const newExp = {
      role: expRole.trim(),
      company: expCompany.trim(),
      period: expPeriod.trim(),
      description: expDesc.trim(),
    };

    let updatedList = [...profExperiences];
    if (expIndex !== null) {
      updatedList[expIndex] = newExp;
    } else {
      updatedList.push(newExp);
    }

    setProfExperiences(updatedList);
    // Reset Experience form
    setExpIndex(null);
    setExpRole("");
    setExpCompany("");
    setExpPeriod("");
    setExpDesc("");

    await handleSaveProfile({ experience: updatedList });
  };

  const handleDeleteExperience = async (idx: number) => {
    if (window.confirm("Are you sure you want to remove this experience?")) {
      const updatedList = profExperiences.filter((_, i) => i !== idx);
      setProfExperiences(updatedList);
      await handleSaveProfile({ experience: updatedList });
    }
  };

  const handleEditExperience = (idx: number) => {
    const item = profExperiences[idx];
    setExpIndex(idx);
    setExpRole(item.role);
    setExpCompany(item.company);
    setExpPeriod(item.period);
    setExpDesc(item.description);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Behind the Designer (Fun Facts) handlers
  const handleSaveFunFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!funTitle.trim() || !funValue.trim()) {
      setError("Please fill in Fact label & description.");
      return;
    }

    const newFact = {
      category: funCategory,
      title: funTitle.trim(),
      value: funValue.trim(),
      uid: funUid.trim() || undefined,
      tiktokUrl: funTiktokUrl.trim() || undefined,
      image: funImage || undefined,
    };

    let updatedList = [...profFunFacts];
    if (funIndex !== null) {
      updatedList[funIndex] = newFact;
    } else {
      updatedList.push(newFact);
    }

    setProfFunFacts(updatedList);
    // Reset Fun facts form
    setFunIndex(null);
    setFunTitle("");
    setFunValue("");
    setFunUid("");
    setFunTiktokUrl("");
    setFunImage("");

    await handleSaveProfile({ funFacts: updatedList });
  };

  const handleDeleteFunFact = async (idx: number) => {
    if (window.confirm("Are you sure you want to remove this Behind the Designer card?")) {
      const updatedList = profFunFacts.filter((_, i) => i !== idx);
      setProfFunFacts(updatedList);
      await handleSaveProfile({ funFacts: updatedList });
    }
  };

  const handleEditFunFact = (idx: number) => {
    const item = profFunFacts[idx];
    setFunIndex(idx);
    setFunCategory(item.category || "CREATIVE TOOLKIT 💻");
    setFunTitle(item.title);
    setFunValue(item.value);
    setFunUid(item.uid || "");
    setFunTiktokUrl(item.tiktokUrl || "");
    setFunImage(item.image || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFunFactImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setError(null);
        const base64 = await optimizeAndConvertToBase64(file);
        setFunImage(base64);
      } catch (err: any) {
        setError("Error optimizing showcase image: " + err.message);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthError(null);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        throw new Error("Invalid password");
      }
      const data = await res.json();
      localStorage.setItem("dipesh_admin_token", data.token);
      setToken(data.token);
      setPassword("");
    } catch (err: any) {
      setAuthError(err.message || "Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dipesh_admin_token");
    setToken(null);
    setProjects([]);
  };

  // Image Upload optimized client-side
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setError(null);
        const optimizedBase64 = await optimizeAndConvertToBase64(file);
        setThumbnail(optimizedBase64);
      } catch (err) {
        setError("Error optimizing selected image.");
      }
    }
  };

  const handleGalleryUploads = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        setError(null);
        const optimizedPromises = Array.from(files).map((file) => optimizeAndConvertToBase64(file as File));
        const results = await Promise.all(optimizedPromises);
        setGallery((prev) => [...prev, ...results]);
      } catch (err) {
        setError("Error optimizing selected gallery images.");
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetForm = () => {
    setTitle("");
    setSlug("");
    setShortDescription("");
    setDescription("");
    setCategory("Graphic Design");
    setTagsInput("");
    setSoftwareInput("");
    setClient("");
    setCompletionDate("");
    setProjectUrl("");
    setFeatured(false);
    setStatus("Published");
    setThumbnail(null);
    setGallery([]);
    setEditingId(null);
  };

  const handleEdit = (proj: ProjectCMS) => {
    setEditingId(proj.id);
    setTitle(proj.title);
    setSlug(proj.slug);
    setShortDescription(proj.short_description);
    setDescription(proj.description);
    setCategory(proj.category);
    setTagsInput(proj.tags.join(", "));
    setSoftwareInput(proj.software_used.join(", "));
    setClient(proj.client || "");
    setCompletionDate(proj.completion_date || "");
    setProjectUrl(proj.project_url || "");
    setFeatured(proj.featured);
    setStatus(proj.status);
    setThumbnail(proj.thumbnail);
    setGallery(proj.gallery || []);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !shortDescription.trim() || !description.trim()) {
      setError("Please fill in all required fields marked with *");
      return;
    }
    if (!thumbnail) {
      setError("Please upload a thumbnail image *");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        short_description: shortDescription.trim(),
        description: description.trim(),
        category,
        tags: tagsInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0),
        software_used: softwareInput.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
        client: client.trim(),
        completion_date: completionDate.trim(),
        project_url: projectUrl.trim(),
        featured,
        status,
        thumbnail,
        gallery,
        display_order: editingId ? undefined : projects.length // append to bottom if new
      };

      const url = editingId 
        ? `/api/admin/graphics-projects/${editingId}` 
        : "/api/admin/graphics-projects";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Server failed to save project");
      }

      setSuccess(editingId ? "Project updated successfully!" : "New project published!");
      handleResetForm();
      loadProjects();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to save project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this project? This action is irreversible.")) {
      try {
        setError(null);
        const res = await fetch(`/api/admin/graphics-projects/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Could not delete project");
        setSuccess("Project deleted successfully.");
        loadProjects();
        setTimeout(() => setSuccess(null), 3500);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const toggleFeatured = async (proj: ProjectCMS) => {
    try {
      const res = await fetch(`/api/admin/graphics-projects/${proj.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ featured: !proj.featured })
      });
      if (!res.ok) throw new Error("Failed to toggle feature state");
      loadProjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleStatus = async (proj: ProjectCMS) => {
    const newStatus = proj.status === "Published" ? "Draft" : "Published";
    try {
      const res = await fetch(`/api/admin/graphics-projects/${proj.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to toggle publish status");
      loadProjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // HTML5 Drag and Drop Reordering Handlers
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;

    const listCopy = [...projects];
    const [draggedItem] = listCopy.splice(draggedIdx, 1);
    listCopy.splice(targetIdx, 0, draggedItem);

    // Recalculate display_orders sequentially
    const updatedWithOrders = listCopy.map((p, index) => ({
      ...p,
      display_order: index
    }));

    // Optimistically update frontend
    setProjects(updatedWithOrders);
    setDraggedIdx(null);

    // Save order map to server
    try {
      const ordersMap: Record<string, number> = {};
      updatedWithOrders.forEach((p) => {
        ordersMap[p.id] = p.display_order;
      });

      const res = await fetch("/api/admin/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ orders: ordersMap })
      });
      if (!res.ok) throw new Error("Failed to save layout order");
      setSuccess("Project layout order updated.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      loadProjects(); // reload on fail
    }
  };

  // Move up/down fallback for mobile reordering
  const moveProject = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= projects.length) return;

    const listCopy = [...projects];
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIdx];
    listCopy[targetIdx] = temp;

    const updatedWithOrders = listCopy.map((p, idx) => ({
      ...p,
      display_order: idx
    }));

    setProjects(updatedWithOrders);

    try {
      const ordersMap: Record<string, number> = {};
      updatedWithOrders.forEach((p) => {
        ordersMap[p.id] = p.display_order;
      });

      const res = await fetch("/api/admin/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ orders: ordersMap })
      });
      if (!res.ok) throw new Error("Failed to save layout order");
    } catch (err: any) {
      setError(err.message);
      loadProjects();
    }
  };

  // RENDER LOGIN SCREEN
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 font-sans" id="admin-login-screen">
        <div className="bg-white border border-neutral-200 p-8 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Lock size={18} className="text-neutral-500" />
          </div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight uppercase font-sans mb-1">
            Studio Security Ingress
          </h1>
          <p className="text-xs text-neutral-400 font-sans mb-6">
            Input password to gain project CMS credentials.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-4 pr-12 py-3 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans text-xs text-center font-bold tracking-widest"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors p-1 rounded-md focus:outline-none"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {authError && (
              <div className="text-[10px] text-rose-600 font-bold flex items-center gap-1 justify-center">
                <AlertCircle size={10} /> {authError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-black hover:bg-neutral-800 text-white font-bold tracking-wider uppercase py-3 rounded-xl transition-all cursor-pointer text-xs"
            >
              Authenticate Dashboard
            </button>
          </form>

          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black font-semibold uppercase tracking-wider transition-colors cursor-pointer mt-6"
          >
            <ArrowLeft size={12} /> Back to Site
          </button>
        </div>
      </div>
    );
  }

  // Statistics calculation
  const stats = {
    total: projects.length,
    published: projects.filter((p) => p.status === "Published").length,
    drafts: projects.filter((p) => p.status === "Draft").length,
    featured: projects.filter((p) => p.featured).length
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans" id="admin-dashboard-panel">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6 mb-8" id="admin-header">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black font-semibold uppercase tracking-wider transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft size={14} /> View Studio Portfolio
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase font-sans">
            Creations CMS Engine
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Admin dashboard managing Graphics & Visual Design projects dynamically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadProjects}
            className="p-2 border border-neutral-200 rounded-xl bg-white hover:bg-neutral-50 transition-colors text-neutral-500 hover:text-black cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 text-[10px] font-bold text-neutral-500 hover:text-red-600 border border-neutral-200 bg-white hover:border-red-200 rounded-xl transition-colors cursor-pointer font-mono"
          >
            LOGOUT SESSION
          </button>
        </div>
      </div>

      {/* Tab selectors */}
      <div className="flex border-b border-neutral-200 mb-8 gap-6" id="admin-tabs">
        <button
          onClick={() => {
            setActiveTab("projects");
            setError(null);
            setSuccess(null);
          }}
          className={`pb-3 text-xs font-bold tracking-wider uppercase transition-all border-b-2 cursor-pointer ${
            activeTab === "projects" ? "border-black text-black" : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          Projects CMS
        </button>
        <button
          onClick={() => {
            setActiveTab("profile");
            setError(null);
            setSuccess(null);
          }}
          className={`pb-3 text-xs font-bold tracking-wider uppercase transition-all border-b-2 cursor-pointer ${
            activeTab === "profile" ? "border-black text-black" : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          Profile Sections CMS
        </button>
      </div>

      {activeTab === "projects" && (
        /* Key Statistics Cards */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" id="admin-stats-grid">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Total Creations</span>
            <span className="text-2xl font-black text-neutral-950 mt-1">{stats.total}</span>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Published</span>
            <span className="text-2xl font-black text-emerald-600 mt-1">{stats.published}</span>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Draft Backlog</span>
            <span className="text-2xl font-black text-amber-500 mt-1">{stats.drafts}</span>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Featured Items</span>
            <span className="text-2xl font-black text-purple-600 mt-1">{stats.featured}</span>
          </div>
        </div>
      )}

      {/* Action Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2"
          >
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2"
          >
            <Check size={14} className="shrink-0 text-emerald-600" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === "projects" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="admin-main-cols">
        {/* Project Form (Span 5) */}
        <div className="lg:col-span-5" id="admin-form-container">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sticky top-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 mb-5 flex items-center gap-2 border-b border-neutral-150 pb-3">
              <Sparkles size={14} className="text-neutral-500" />
              {editingId ? "Modify Portfolio Item" : "Create Creative Case"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-bold mb-1">Project Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Noir Coffee Packaging"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-bold mb-1">SEO URL Slug *</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                    placeholder="e.g. noir-coffee-packaging"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-mono font-bold text-[10px]"
                    required
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-neutral-700 font-bold mb-1">Card Brief Description *</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="e.g. Sustainable cold brew custom box diecut design and layout"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-bold mb-1">Full Challenge & Process Narrative *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the challenge requirements, design philosophy, materials selection, or typesetting layout grids..."
                  rows={4}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans resize-none"
                  required
                />
              </div>

              {/* Specialty & URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-bold mb-1">Design Specialization *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                  >
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Branding">Branding</option>
                    <option value="Packaging Design">Packaging Design</option>
                    <option value="Web Design">Web Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-bold mb-1">External Case Link (Optional)</label>
                  <input
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://behance.net/..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Client & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-bold mb-1">Client Name (Optional)</label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="e.g. Basel Museum"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-bold mb-1">Completion Date *</label>
                  <input
                    type="month"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                    required
                  />
                </div>
              </div>

              {/* Tags & Software */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-bold mb-1">Tags (Comma split)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. Typography, Grid, Print"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-bold mb-1">Software Toolkit (Comma split)</label>
                  <input
                    type="text"
                    value={softwareInput}
                    onChange={(e) => setSoftwareInput(e.target.value)}
                    placeholder="e.g. Illustrator, InDesign"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Thumbnail Upload & Optimization */}
              <div>
                <label className="block text-neutral-700 font-bold mb-1">Optimized Thumbnail Image *</label>
                <div className="relative border border-dashed border-neutral-300 bg-neutral-50 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:bg-neutral-100/50 hover:border-neutral-400">
                  <input
                    type="file"
                    accept="image/png, image/jpg, image/jpeg, image/webp"
                    onChange={handleThumbnailUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {thumbnail ? (
                    <div className="relative w-full flex flex-col items-center">
                      <img
                        src={thumbnail}
                        alt="Thumbnail upload preview"
                        referrerPolicy="no-referrer"
                        className="max-h-24 object-contain rounded border border-neutral-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setThumbnail(null); }}
                        className="mt-2 text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer bg-neutral-100 px-2 py-1 rounded"
                      >
                        <X size={10} /> Remove Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={18} className="text-neutral-400 mb-1" />
                      <span className="text-[10px] text-neutral-500 font-medium">
                        Drag thumbnail or <span className="text-blue-600 underline">browse</span>
                      </span>
                      <span className="text-[9px] text-neutral-400 mt-0.5">Optimizes automatically. PNG, JPG, JPEG, WEBP</span>
                    </>
                  )}
                </div>
              </div>

              {/* Multi Gallery Upload */}
              <div>
                <label className="block text-neutral-700 font-bold mb-1">Optimized Gallery Assets (Optional)</label>
                <div className="relative border border-dashed border-neutral-300 bg-neutral-50 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:bg-neutral-100/50 hover:border-neutral-400 mb-2">
                  <input
                    type="file"
                    multiple
                    accept="image/png, image/jpg, image/jpeg, image/webp"
                    onChange={handleGalleryUploads}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload size={18} className="text-neutral-400 mb-1" />
                  <span className="text-[10px] text-neutral-500 font-medium">
                    Choose multiple photos or <span className="text-blue-600 underline">browse</span>
                  </span>
                  <span className="text-[9px] text-neutral-400 mt-0.5 font-mono">Appends to gallery showcase</span>
                </div>

                {/* Gallery List Previews */}
                {gallery.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 border border-neutral-200 rounded-xl p-3 bg-neutral-50">
                    {gallery.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg border border-neutral-200 bg-white overflow-hidden group">
                        <img src={img} alt="Gallery item" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(i)}
                          className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 rounded-full text-white cursor-pointer transition-colors"
                          title="Remove from gallery"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured & Status Toggles */}
              <div className="flex gap-4 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700 select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-black border-neutral-300 rounded focus:ring-0 cursor-pointer"
                  />
                  Feature Creation
                </label>

                <div className="w-px h-5 bg-neutral-200" />

                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700 select-none">
                  <input
                    type="checkbox"
                    checked={status === "Published"}
                    onChange={(e) => setStatus(e.target.checked ? "Published" : "Draft")}
                    className="w-4 h-4 text-black border-neutral-300 rounded focus:ring-0 cursor-pointer"
                  />
                  Publish Project (Live)
                </label>
              </div>

              {/* Form Action Controls */}
              <div className="flex gap-2 pt-2 border-t border-neutral-150">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-black hover:bg-neutral-800 disabled:opacity-40 text-white font-bold tracking-wider uppercase py-2.5 rounded-xl transition-all cursor-pointer text-xs"
                >
                  {isSubmitting ? "Uploading & Writing..." : editingId ? "Save Changes" : "Publish Creation"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-all cursor-pointer text-xs uppercase"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Live List (Span 7) */}
        <div className="lg:col-span-7 space-y-4" id="admin-list-container">
          <div className="flex justify-between items-baseline border-b border-neutral-200 pb-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 font-sans">
              Portfolio Inventory & Layout Reordering
            </h2>
            <span className="text-[10px] font-mono text-neutral-400 font-bold flex items-center gap-1">
              <ArrowUpDown size={10} /> Drag to Reorder
            </span>
          </div>

          <div className="space-y-3" id="inventory-reorder-list">
            {isLoading && projects.length === 0 ? (
              <div className="text-center py-12 bg-white border border-neutral-200 rounded-2xl animate-pulse">
                <p className="text-xs text-neutral-400 font-sans">Fetching portfolio records...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-white border border-neutral-200 rounded-2xl">
                <p className="text-xs text-neutral-400 font-sans">Creations database empty.</p>
              </div>
            ) : (
              projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`bg-white border rounded-xl p-4 flex gap-4 items-center justify-between transition-all group hover:shadow-xs cursor-move ${
                    draggedIdx === idx ? "opacity-30 border-black border-dashed" : "border-neutral-200"
                  }`}
                >
                  {/* Thumbnail Preview */}
                  <div className="w-12 h-12 rounded-lg bg-neutral-50 overflow-hidden border border-neutral-200 shrink-0 select-none">
                    <img src={proj.thumbnail} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>

                  {/* Metas */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 text-[8px] font-mono font-black uppercase tracking-wide rounded">
                        {proj.category}
                      </span>
                      {proj.featured && (
                        <span className="bg-purple-50 text-purple-700 text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 font-mono border border-purple-100">
                          <Star size={7} className="fill-purple-700" /> Featured
                        </span>
                      )}
                      <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded border ${
                        proj.status === "Published" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {proj.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-neutral-950 mt-1 truncate">
                      {proj.title}
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-sans line-clamp-1 mt-0.5">
                      {proj.short_description}
                    </p>
                  </div>

                  {/* Display Order Mobile Fallback Controls and CRUD Operations */}
                  <div className="flex items-center gap-1 pl-2 shrink-0">
                    {/* Reorder fallback */}
                    <div className="flex flex-col gap-0.5 mr-2">
                      <button
                        onClick={() => moveProject(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded disabled:opacity-25 transition-all cursor-pointer"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveProject(idx, "down")}
                        disabled={idx === projects.length - 1}
                        className="p-1 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded disabled:opacity-25 transition-all cursor-pointer"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="w-px h-6 bg-neutral-200 mr-2" />

                    <button
                      onClick={() => toggleFeatured(proj)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        proj.featured 
                          ? "text-purple-600 hover:bg-purple-50" 
                          : "text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
                      }`}
                      title={proj.featured ? "Unfeature item" : "Feature item"}
                    >
                      <Star size={13} className={proj.featured ? "fill-purple-600" : ""} />
                    </button>

                    <button
                      onClick={() => toggleStatus(proj)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        proj.status === "Published"
                          ? "text-emerald-600 hover:bg-emerald-50"
                          : "text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
                      }`}
                      title={proj.status === "Published" ? "Convert to Draft" : "Convert to Published"}
                    >
                      {proj.status === "Published" ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>

                    <button
                      onClick={() => handleEdit(proj)}
                      className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit details"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Permanently Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="profile-cms-grid">
          {/* Column 1: General & Contact Info (Span 5) */}
          <div className="lg:col-span-5">
            <form onSubmit={handleSaveGeneralAndContact} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 text-xs sticky top-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 mb-4 pb-3 border-b border-neutral-100 flex items-center gap-2">
                <Sparkles size={14} className="text-neutral-500" />
                General & Contact Info
              </h2>

              {/* Avatar upload */}
              <div>
                <label className="block text-neutral-700 font-bold mb-1.5 uppercase tracking-wide">Profile Avatar Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-neutral-200 bg-neutral-50 shrink-0">
                    {profAvatar ? (
                      <img src={profAvatar} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300 font-mono text-[10px]">NO IMAGE</div>
                    )}
                  </div>
                  <label className="flex-1 border border-dashed border-neutral-300 hover:border-black rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all bg-neutral-50 hover:bg-neutral-100 text-center">
                    <Upload size={14} className="text-neutral-400 mb-1" />
                    <span className="text-[10px] font-bold text-neutral-600">UPLOAD AVATAR</span>
                    <input type="file" onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-neutral-700 font-bold mb-1 uppercase tracking-wide">My Name</label>
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  placeholder="e.g. Dipesh"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                  required
                />
              </div>

              {/* Role Title */}
              <div>
                <label className="block text-neutral-700 font-bold mb-1 uppercase tracking-wide">Role Title</label>
                <input
                  type="text"
                  value={profRoleTitle}
                  onChange={(e) => setProfRoleTitle(e.target.value)}
                  placeholder="e.g. Graphics Designer & AI Engineer"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-neutral-700 font-bold mb-1 uppercase tracking-wide">Location</label>
                <input
                  type="text"
                  value={profLocation}
                  onChange={(e) => setProfLocation(e.target.value)}
                  placeholder="e.g. Kathmandu, Nepal"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-neutral-700 font-bold mb-1 uppercase tracking-wide">Bio / Introduction</label>
                <textarea
                  value={profBio}
                  onChange={(e) => setProfBio(e.target.value)}
                  placeholder="Write a warm, compelling personal biography..."
                  rows={4}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans resize-none"
                  required
                />
              </div>

              <div className="border-t border-neutral-100 pt-4 mt-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-3 font-mono">Contact Details & Social Links</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-700 font-bold mb-1 uppercase tracking-wide">Contact Section Headline</label>
                    <input
                      type="text"
                      value={profContactHeadline}
                      onChange={(e) => setProfContactHeadline(e.target.value)}
                      placeholder="e.g. Let's create something extraordinary."
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1 uppercase tracking-wide">Contact Sub-context</label>
                    <textarea
                      value={profContactContext}
                      onChange={(e) => setProfContactContext(e.target.value)}
                      placeholder="e.g. Seeking freelance design and AI developer collaborations..."
                      rows={2}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-bold mb-1 uppercase tracking-wide">Email Coordinates</label>
                    <input
                      type="email"
                      value={profContactEmail}
                      onChange={(e) => setProfContactEmail(e.target.value)}
                      placeholder="e.g. dondipesh897@gmail.com"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-neutral-700 font-bold mb-1 uppercase tracking-wide">GitHub URL</label>
                      <input
                        type="text"
                        value={profContactGithub}
                        onChange={(e) => setProfContactGithub(e.target.value)}
                        placeholder="Github link"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 font-bold mb-1 uppercase tracking-wide">LinkedIn URL</label>
                      <input
                        type="text"
                        value={profContactLinkedin}
                        onChange={(e) => setProfContactLinkedin(e.target.value)}
                        placeholder="LinkedIn link"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-neutral-400 transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-neutral-800 text-white py-3 rounded-xl font-bold uppercase tracking-wider cursor-pointer transition-colors mt-6 text-center text-[10px]"
              >
                {isSubmitting ? "SAVING UPDATES..." : "SAVE GENERAL & CONTACT INFO"}
              </button>
            </form>
          </div>

          {/* Column 2: Skills, Work Experience, and Behind the Designer Sections (Span 7) */}
          <div className="lg:col-span-7 space-y-8 text-xs">
            
            {/* SECTION A: SKILLS CLOUD CMS */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
                Skills Catalog Management
              </h2>
              
              <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g. Blender, UI/UX, TypeScript)"
                  className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-neutral-400 transition-all"
                />
                <button
                  type="submit"
                  className="px-4 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold flex items-center justify-center cursor-pointer transition-colors gap-1 uppercase font-mono text-[10px]"
                >
                  <Plus size={12} /> ADD
                </button>
              </form>

              <div className="flex flex-wrap gap-2" id="admin-skills-cloud">
                {profSkills.length === 0 ? (
                  <p className="text-[10px] text-neutral-400">No skills declared yet.</p>
                ) : (
                  profSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-800 rounded-lg text-xs font-medium border border-neutral-200 font-sans"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(skill)}
                        className="text-neutral-400 hover:text-red-600 transition-colors p-0.5 rounded cursor-pointer"
                        title="Remove skill"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* SECTION B: WORK LOG EXPERIENCE CMS */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
                Work Log / Experience CMS
              </h2>

              <form onSubmit={handleSaveExperience} className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-150 mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block font-mono">
                  {expIndex !== null ? `Editing Work Log #${expIndex + 1}` : "Create New Work Log"}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">Job Role *</label>
                    <input
                      type="text"
                      value={expRole}
                      onChange={(e) => setExpRole(e.target.value)}
                      placeholder="e.g. Graphics Designer"
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">Company / Team *</label>
                    <input
                      type="text"
                      value={expCompany}
                      onChange={(e) => setExpCompany(e.target.value)}
                      placeholder="e.g. Creative Studio"
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-400 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">Time Period *</label>
                    <input
                      type="text"
                      value={expPeriod}
                      onChange={(e) => setExpPeriod(e.target.value)}
                      placeholder="e.g. 2024 - Present"
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 font-bold mb-1">Responsibility Summary *</label>
                  <textarea
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="Describe your core contributions, milestones, and results..."
                    rows={2}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-400 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-black hover:bg-neutral-800 text-white py-2 rounded-lg font-bold uppercase tracking-wider cursor-pointer transition-colors font-mono text-[10px]"
                  >
                    {expIndex !== null ? "SAVE WORK LOG CHANGES" : "ADD WORK LOG RECORD"}
                  </button>
                  {expIndex !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setExpIndex(null);
                        setExpRole("");
                        setExpCompany("");
                        setExpPeriod("");
                        setExpDesc("");
                      }}
                      className="px-4 border border-neutral-200 hover:border-black rounded-lg text-neutral-500 hover:text-black font-bold uppercase tracking-wider cursor-pointer transition-colors font-mono text-[10px]"
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </form>

              {/* Experiences Inventory List */}
              <div className="space-y-3 font-sans">
                {profExperiences.length === 0 ? (
                  <p className="text-[10px] text-neutral-400">No experiences registered in profile database.</p>
                ) : (
                  profExperiences.map((exp, idx) => (
                    <div key={idx} className="bg-neutral-50 border border-neutral-150 rounded-xl p-4 flex gap-4 justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-neutral-200 text-neutral-700 text-[8px] font-mono font-black uppercase tracking-wider rounded">
                            {exp.period}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-neutral-900 mt-1">
                          {exp.role} @ <span className="text-neutral-500">{exp.company}</span>
                        </h4>
                        <p className="text-[10px] text-neutral-500 mt-1 font-sans leading-relaxed whitespace-pre-wrap">
                          {exp.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 pl-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditExperience(idx)}
                          className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition-all cursor-pointer"
                          title="Edit log details"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(idx)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Remove log"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION C: BEHIND THE DESIGNER TIMELINE CMS */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
                Behind the Designer CMS
              </h2>

              <form onSubmit={handleSaveFunFact} className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-150 mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block font-mono">
                  {funIndex !== null ? `Editing Behind the Designer Card #${funIndex + 1}` : "Create Behind the Designer Card"}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">Card Theme Label (With Emoji) *</label>
                    <select
                      value={funCategory}
                      onChange={(e) => setFunCategory(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-400 transition-all font-sans text-xs"
                    >
                      <option value="CREATIVE TOOLKIT 💻">CREATIVE TOOLKIT 💻</option>
                      <option value="DESIGN PHILOSOPHY 🎨">DESIGN PHILOSOPHY 🎨</option>
                      <option value="DAILY ROUTINE ☕">DAILY ROUTINE ☕</option>
                      <option value="CREATIVE MINDSET 🧠">CREATIVE MINDSET 🧠</option>
                      <option value="FUN LOG 🎮">FUN LOG 🎮</option>
                      <option value="INTEREST ⚽">INTEREST ⚽</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">Title *</label>
                    <input
                      type="text"
                      value={funTitle}
                      onChange={(e) => setFunTitle(e.target.value)}
                      placeholder="e.g. My Design Stack"
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-400 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">Free Fire UID (Optional)</label>
                    <input
                      type="text"
                      value={funUid}
                      onChange={(e) => setFunUid(e.target.value)}
                      placeholder="e.g. 949629390"
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-bold mb-1">TikTok Link (Optional)</label>
                    <input
                      type="text"
                      value={funTiktokUrl}
                      onChange={(e) => setFunTiktokUrl(e.target.value)}
                      placeholder="e.g. https://tiktok.com/@..."
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-400 transition-all"
                    />
                  </div>
                </div>

                {/* Card image asset upload */}
                <div>
                  <label className="block text-neutral-700 font-bold mb-1.5 uppercase tracking-wide">Showcase Image / Game Profile Photo (Optional)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded overflow-hidden border border-neutral-200 bg-white shrink-0">
                      {funImage ? (
                        <img src={funImage} alt="Showcase" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300 text-[8px] text-center font-mono p-1 bg-neutral-50 leading-tight">NO IMAGE</div>
                      )}
                    </div>
                    <label className="flex-1 border border-dashed border-neutral-300 hover:border-black rounded-lg p-2.5 flex flex-col items-center justify-center cursor-pointer transition-all bg-white hover:bg-neutral-100 text-center">
                      <Upload size={12} className="text-neutral-400 mb-0.5" />
                      <span className="text-[9px] font-bold text-neutral-600">CHOOSE PROFILE OR STACK PHOTO</span>
                      <input type="file" onChange={handleFunFactImageUpload} accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 font-bold mb-1">Description / Value *</label>
                  <textarea
                    value={funValue}
                    onChange={(e) => setFunValue(e.target.value)}
                    placeholder="Provide a detailed description of the tools or story behind this interest..."
                    rows={3}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-400 transition-all resize-none font-sans"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-black hover:bg-neutral-800 text-white py-2 rounded-lg font-bold uppercase tracking-wider cursor-pointer transition-colors font-mono text-[10px]"
                  >
                    {funIndex !== null ? "SAVE CARD CHANGES" : "ADD TIMELINE CARD"}
                  </button>
                  {funIndex !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setFunIndex(null);
                        setFunTitle("");
                        setFunValue("");
                        setFunUid("");
                        setFunTiktokUrl("");
                        setFunImage("");
                      }}
                      className="px-4 border border-neutral-200 hover:border-black rounded-lg text-neutral-500 hover:text-black font-bold uppercase tracking-wider cursor-pointer transition-colors font-mono text-[10px]"
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </form>

              {/* Fun Facts Inventory List */}
              <div className="space-y-3 font-sans">
                {profFunFacts.length === 0 ? (
                  <p className="text-[10px] text-neutral-400">No Behind the Designer cards registered.</p>
                ) : (
                  profFunFacts.map((fact, idx) => (
                    <div key={idx} className="bg-neutral-50 border border-neutral-150 rounded-xl p-4 flex gap-4 justify-between items-start">
                      {/* Image Preview */}
                      {fact.image && (
                        <div className="w-12 h-12 rounded bg-white overflow-hidden border border-neutral-200 shrink-0">
                          <img src={fact.image} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-neutral-200 text-neutral-700 text-[8px] font-mono font-black uppercase tracking-wider rounded">
                            {fact.category || "BEHIND THE DESIGNER"}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-neutral-900 mt-1">
                          {fact.title}
                        </h4>
                        <p className="text-[10px] text-neutral-500 mt-1 font-sans leading-relaxed line-clamp-2">
                          {fact.value}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[8px] font-mono font-bold text-neutral-400">
                          {fact.uid && <span>FF UID: {fact.uid}</span>}
                          {fact.tiktokUrl && <span className="truncate max-w-[120px]">TIKTOK: {fact.tiktokUrl}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 pl-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditFunFact(idx)}
                          className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition-all cursor-pointer"
                          title="Edit card details"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFunFact(idx)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Remove card"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

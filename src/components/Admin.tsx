import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  Trash2, 
  Plus, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Sliders, 
  Check, 
  Briefcase, 
  Sparkles, 
  Mail, 
  Lock, 
  LogOut,
  ChevronDown,
  ChevronUp,
  Settings,
  Grid,
  Heart
} from 'lucide-react';
import { ProjectCMS } from './ProjectDetails';

interface AdminProps {
  onBack: () => void;
  profile: any;
  onUpdateProfile: (updated: any) => void;
}

const Admin: React.FC<AdminProps> = ({ onBack, profile, onUpdateProfile }) => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Tab Management: "profile" | "projects"
  const [activeTab, setActiveTab] = useState<'profile' | 'projects'>('profile');

  // Local Editable Profile State
  const [editableProfile, setEditableProfile] = useState<any>(null);
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Graphics Projects Management State
  const [projectsList, setProjectsList] = useState<ProjectCMS[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState('');
  
  // Project Editor Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<ProjectCMS> | null>(null);
  const [saveProjectLoading, setSaveProjectLoading] = useState(false);
  const [projectFormError, setProjectFormError] = useState('');

  // Temporary list inputs
  const [newSkill, setNewSkill] = useState('');
  
  // Initialise local editable profile once profile is available
  useEffect(() => {
    if (profile) {
      setEditableProfile(JSON.parse(JSON.stringify(profile)));
    }
  }, [profile]);

  // Load projects from database
  const loadProjects = async (authToken: string) => {
    setProjectsLoading(true);
    setProjectsError('');
    try {
      const response = await fetch('/api/admin/graphics-projects', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProjectsList(data);
      } else {
        const text = await response.text();
        setProjectsError(`Failed to load projects: ${text}`);
      }
    } catch (err: any) {
      console.error(err);
      setProjectsError('Error connecting to projects database.');
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        // Automatically fetch projects upon successful login
        loadProjects(data.token);
      } else {
        const text = await response.text();
        let errMsg = 'Login failed';
        try {
          const parsed = JSON.parse(text);
          errMsg = parsed.error || errMsg;
        } catch (_) {
          errMsg = `Server error (${response.status}): ${text.substring(0, 80)}`;
        }
        setError(errMsg);
      }
    } catch (e) {
      console.error("Login fetch error:", e);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setPassword('');
    setError('');
  };

  // Profile management helpers
  const handleProfileFieldChange = (section: string, field: string | null, value: any) => {
    if (!editableProfile) return;
    const clone = { ...editableProfile };
    if (section === 'root') {
      clone[field!] = value;
    } else if (section === 'contact') {
      clone.contact = { ...clone.contact, [field!]: value };
    }
    setEditableProfile(clone);
  };

  // Handle Avatar image file upload to base64
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editableProfile) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setEditableProfile({ ...editableProfile, avatarUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  // Add/Remove Skills
  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || !editableProfile) return;
    if (editableProfile.skills.includes(trimmed)) return;
    const clone = { ...editableProfile };
    clone.skills = [...clone.skills, trimmed];
    setEditableProfile(clone);
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    if (!editableProfile) return;
    const clone = { ...editableProfile };
    clone.skills = clone.skills.filter((s: string) => s !== skill);
    setEditableProfile(clone);
  };

  // Experience List Actions
  const handleAddExperience = () => {
    if (!editableProfile) return;
    const clone = { ...editableProfile };
    const newItem = {
      role: "New Role",
      company: "New Company",
      period: "2024 - Present",
      description: "Brief description of achievements and tasks."
    };
    clone.experience = [newItem, ...clone.experience];
    setEditableProfile(clone);
  };

  const handleUpdateExperience = (index: number, field: string, value: string) => {
    if (!editableProfile) return;
    const clone = { ...editableProfile };
    clone.experience[index] = { ...clone.experience[index], [field]: value };
    setEditableProfile(clone);
  };

  const handleRemoveExperience = (index: number) => {
    if (!editableProfile) return;
    const clone = { ...editableProfile };
    clone.experience = clone.experience.filter((_: any, i: number) => i !== index);
    setEditableProfile(clone);
  };

  // Static Web Projects List Actions (from default profile)
  const handleAddWebProject = () => {
    if (!editableProfile) return;
    const clone = { ...editableProfile };
    const newItem = {
      title: "New Web App",
      description: "Sleek frontend web app built with React and Tailwind CSS.",
      tags: ["React", "Tailwind CSS"],
      category: "Web" as const,
      liveUrl: "https://example.com",
      githubUrl: "https://github.com"
    };
    clone.projects = [newItem, ...clone.projects];
    setEditableProfile(clone);
  };

  const handleUpdateWebProject = (index: number, field: string, value: any) => {
    if (!editableProfile) return;
    const clone = { ...editableProfile };
    if (field === 'tags') {
      clone.projects[index][field] = value.split(',').map((tag: string) => tag.trim());
    } else {
      clone.projects[index][field] = value;
    }
    setEditableProfile(clone);
  };

  const handleRemoveWebProject = (index: number) => {
    if (!editableProfile) return;
    const clone = { ...editableProfile };
    clone.projects = clone.projects.filter((_: any, i: number) => i !== index);
    setEditableProfile(clone);
  };

  // Fun Facts List Actions
  const handleAddFunFact = () => {
    if (!editableProfile) return;
    const clone = { ...editableProfile };
    const newItem = {
      category: "CREATIVE 🎨",
      title: "Fact Title",
      value: "A detailed insight or interesting fact story."
    };
    clone.funFacts = [...clone.funFacts, newItem];
    setEditableProfile(clone);
  };

  const handleUpdateFunFact = (index: number, field: string, value: string) => {
    if (!editableProfile) return;
    const clone = { ...editableProfile };
    clone.funFacts[index] = { ...clone.funFacts[index], [field]: value };
    setEditableProfile(clone);
  };

  const handleRemoveFunFact = (index: number) => {
    if (!editableProfile) return;
    const clone = { ...editableProfile };
    clone.funFacts = clone.funFacts.filter((_: any, i: number) => i !== index);
    setEditableProfile(clone);
  };

  // Save profile state to backend
  const handleSaveProfile = async () => {
    if (!editableProfile) return;
    setSaveProfileLoading(true);
    setProfileSuccessMsg('');
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editableProfile),
      });
      if (response.ok) {
        const data = await response.json();
        setEditableProfile(data);
        onUpdateProfile(data); // update parent
        setProfileSuccessMsg('Profile updated successfully!');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      } else {
        const text = await response.text();
        alert(`Failed to save profile: ${text}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile database.');
    } finally {
      setSaveProfileLoading(false);
    }
  };

  // --- Graphics Projects CRUD ---
  const handleOpenProjectModal = (proj: Partial<ProjectCMS> | null = null) => {
    setProjectFormError('');
    if (proj) {
      setEditingProject({ ...proj });
    } else {
      setEditingProject({
        title: '',
        slug: '',
        short_description: '',
        description: '',
        category: 'Graphic Design',
        thumbnail: '',
        gallery: [],
        tags: [],
        software_used: [],
        client: '',
        completion_date: new Date().toISOString().substring(0, 7),
        project_url: '',
        featured: false,
        status: 'Draft',
        display_order: projectsList.length
      });
    }
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleProjectFieldChange = (field: keyof ProjectCMS, value: any) => {
    if (!editingProject) return;
    const updated = { ...editingProject, [field]: value };
    // Auto generate slug from title if empty
    if (field === 'title' && !editingProject.slug) {
      updated.slug = (value as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    setEditingProject(updated);
  };

  const handleProjectThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setEditingProject({ ...editingProject, thumbnail: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleProjectGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingProject) return;
    
    // Process files one by one
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setEditingProject((prev) => {
          if (!prev) return prev;
          const currentGallery = prev.gallery ? [...prev.gallery] : [];
          return { ...prev, gallery: [...currentGallery, base64] };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveGalleryImage = (index: number) => {
    if (!editingProject || !editingProject.gallery) return;
    const copy = [...editingProject.gallery];
    copy.splice(index, 1);
    setEditingProject({ ...editingProject, gallery: copy });
  };

  const handleSaveProject = async () => {
    if (!editingProject || !token) return;
    if (!editingProject.title?.trim()) {
      setProjectFormError('Project title is required.');
      return;
    }
    if (!editingProject.slug?.trim()) {
      setProjectFormError('Project url slug is required.');
      return;
    }

    setSaveProjectLoading(true);
    setProjectFormError('');
    const isNew = !editingProject.id;
    const url = isNew ? '/api/admin/graphics-projects' : `/api/admin/graphics-projects/${editingProject.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProject),
      });

      if (response.ok) {
        // Reload graphics projects list
        await loadProjects(token);
        setIsProjectModalOpen(false);
        setEditingProject(null);
      } else {
        const text = await response.text();
        setProjectFormError(`Error saving project: ${text}`);
      }
    } catch (err: any) {
      console.error(err);
      setProjectFormError('Error sending project to backend.');
    } finally {
      setSaveProjectLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you absolutely sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/admin/graphics-projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await loadProjects(token);
      } else {
        const text = await response.text();
        alert(`Failed to delete project: ${text}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error connecting to backend database.');
    }
  };

  // Standard non-blocking login form if not authenticated
  if (!token) {
    return (
      <div className="max-w-md mx-auto my-12" id="admin-login-screen">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center mb-4">
              <Lock size={20} />
            </div>
            <h2 className="font-serif text-3xl font-normal text-neutral-900 tracking-tight">Admin CMS Login</h2>
            <p className="text-xs text-neutral-400 mt-2 font-mono uppercase tracking-wider">Secure Database Access</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">Admin Security Key</label>
              <input
                id="admin-pass-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                placeholder="Enter workspace secret password"
                className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none transition-all font-mono"
              />
            </div>

            <button
              id="admin-login-btn"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white font-medium rounded-xl text-xs sm:text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin text-neutral-400" size={16} />
                  <span>Validating Key...</span>
                </>
              ) : (
                <>
                  <span>Decrypt & Connect</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-red-600 font-sans" id="admin-login-error">
                ⚠️ {error}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <button 
              onClick={onBack} 
              className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-950 transition-colors cursor-pointer"
            >
              <ArrowLeft size={12} /> Back to Portfolio Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-50 min-h-screen pb-16" id="admin-cms-dashboard">
      {/* Top Controls Bar */}
      <div className="bg-white border-b border-neutral-200/60 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl mb-8 shadow-xs" id="cms-topbar">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-serif text-2xl font-normal text-neutral-900 tracking-tight leading-none">CMS Workspace</h1>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono mt-1 uppercase tracking-wider">Connected Session: Secure SQLite/JSON Database</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-100 rounded-xl p-1" id="cms-tabs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-white text-neutral-950 shadow-xs' 
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'projects' 
                  ? 'bg-white text-neutral-950 shadow-xs' 
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Graphics Projects ({projectsList.length})
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
            title="Lock Panel"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* --- TAB 1: PROFILE SETTINGS CMS --- */}
      {activeTab === 'profile' && editableProfile && (
        <div className="space-y-6" id="cms-profile-editor">
          {profileSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3.5 rounded-xl text-xs flex items-center gap-2 animate-fade-in" id="profile-success-alert">
              <Check size={14} className="text-emerald-600 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {/* Section 1: Basic Identity */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-150 pb-4 mb-2">
              <Settings className="text-neutral-400" size={16} />
              <h2 className="font-serif text-lg font-normal text-neutral-800">Primary Bio & Identity Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Avatar upload */}
              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-neutral-200 bg-neutral-50/50 rounded-2xl text-center">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-3 text-center">Avatar Portrait</label>
                <div className="relative group w-32 h-36 rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-xs mb-3">
                  <img 
                    src={editableProfile.avatarUrl || '/images/avatar.jpg'} 
                    alt="avatar" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Upload size={16} className="text-white" />
                  </div>
                </div>
                <label className="px-3 py-1.5 bg-white border border-neutral-200 text-neutral-700 rounded-lg text-xs font-medium cursor-pointer hover:border-neutral-400 transition-colors">
                  Choose New File
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>

              {/* Text Fields */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">Primary Display Name</label>
                    <input 
                      type="text" 
                      value={editableProfile.name || ''} 
                      onChange={(e) => handleProfileFieldChange('root', 'name', e.target.value)}
                      className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">Display Location / Stamp</label>
                    <input 
                      type="text" 
                      value={editableProfile.location || ''} 
                      onChange={(e) => handleProfileFieldChange('root', 'location', e.target.value)}
                      className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">Professional Headline / Role Title</label>
                  <input 
                    type="text" 
                    value={editableProfile.roleTitle || ''} 
                    onChange={(e) => handleProfileFieldChange('root', 'roleTitle', e.target.value)}
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">Short Biographic Core Text</label>
                  <textarea 
                    rows={3}
                    value={editableProfile.bio || ''} 
                    onChange={(e) => handleProfileFieldChange('root', 'bio', e.target.value)}
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Channels & Connections */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-150 pb-4 mb-2">
              <Mail className="text-neutral-400" size={16} />
              <h2 className="font-serif text-lg font-normal text-neutral-800">Contact & Social Channels</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">Contact Headline Header</label>
                <input 
                  type="text" 
                  value={editableProfile.contact?.headline || ''} 
                  onChange={(e) => handleProfileFieldChange('contact', 'headline', e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">Contact Email Address</label>
                <input 
                  type="email" 
                  value={editableProfile.contact?.email || ''} 
                  onChange={(e) => handleProfileFieldChange('contact', 'email', e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">Contact Core Subtext Context</label>
                <textarea 
                  rows={2}
                  value={editableProfile.contact?.context || ''} 
                  onChange={(e) => handleProfileFieldChange('contact', 'context', e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">GitHub Profile URL</label>
                <input 
                  type="text" 
                  value={editableProfile.contact?.github || ''} 
                  onChange={(e) => handleProfileFieldChange('contact', 'github', e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">LinkedIn Profile URL</label>
                <input 
                  type="text" 
                  value={editableProfile.contact?.linkedin || ''} 
                  onChange={(e) => handleProfileFieldChange('contact', 'linkedin', e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Skills List CMS */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-150 pb-4 mb-2">
              <Sliders className="text-neutral-400" size={16} />
              <h2 className="font-serif text-lg font-normal text-neutral-800">Expertise / Skills List ({editableProfile.skills?.length || 0})</h2>
            </div>

            <div className="flex items-center gap-2 max-w-md">
              <input 
                type="text" 
                placeholder="Add a skill badge (e.g. Figma)" 
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(); }}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:border-neutral-900 outline-none"
              />
              <button 
                onClick={handleAddSkill}
                className="p-2.5 bg-black text-white rounded-xl text-xs hover:bg-neutral-800 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {editableProfile.skills?.map((skill: string, idx: number) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center gap-1 text-xs font-mono px-3 py-1.5 bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-700 border border-neutral-200 rounded-full transition-colors cursor-pointer"
                  onClick={() => handleRemoveSkill(skill)}
                  title="Click to remove"
                >
                  {skill}
                  <X size={10} className="text-neutral-400 hover:text-red-600" />
                </span>
              ))}
            </div>
          </div>

          {/* Section 4: Static Web Projects Editor */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-150 pb-4 mb-2">
              <div className="flex items-center gap-2">
                <Grid className="text-neutral-400" size={16} />
                <h2 className="font-serif text-lg font-normal text-neutral-800">Static Web Projects ({editableProfile.projects?.length || 0})</h2>
              </div>
              <button
                onClick={handleAddWebProject}
                className="px-3 py-1.5 bg-black text-white rounded-lg text-xs hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={12} /> Add Web Project
              </button>
            </div>

            <div className="space-y-6">
              {editableProfile.projects?.map((proj: any, idx: number) => (
                <div key={idx} className="p-5 border border-neutral-250 bg-neutral-50/20 rounded-xl space-y-4 relative group/proj">
                  <button
                    onClick={() => handleRemoveWebProject(idx)}
                    className="absolute top-4 right-4 p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                    title="Remove Project"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Project Title</label>
                      <input 
                        type="text" 
                        value={proj.title || ''} 
                        onChange={(e) => handleUpdateWebProject(idx, 'title', e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Tags (Comma-separated)</label>
                      <input 
                        type="text" 
                        value={proj.tags?.join(', ') || ''} 
                        onChange={(e) => handleUpdateWebProject(idx, 'tags', e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs font-mono"
                        placeholder="e.g. React, Tailwind, Vite"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Short Description</label>
                      <input 
                        type="text" 
                        value={proj.description || ''} 
                        onChange={(e) => handleUpdateWebProject(idx, 'description', e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Live Preview Link URL</label>
                      <input 
                        type="text" 
                        value={proj.liveUrl || ''} 
                        onChange={(e) => handleUpdateWebProject(idx, 'liveUrl', e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">GitHub Repository URL</label>
                      <input 
                        type="text" 
                        value={proj.githubUrl || ''} 
                        onChange={(e) => handleUpdateWebProject(idx, 'githubUrl', e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Experience Timeline CMS */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-150 pb-4 mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="text-neutral-400" size={16} />
                <h2 className="font-serif text-lg font-normal text-neutral-800">Experience Timeline ({editableProfile.experience?.length || 0})</h2>
              </div>
              <button 
                onClick={handleAddExperience}
                className="px-3 py-1.5 bg-black text-white rounded-lg text-xs hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={12} /> Add Milestone
              </button>
            </div>

            <div className="space-y-6">
              {editableProfile.experience?.map((exp: any, idx: number) => (
                <div key={idx} className="p-5 border border-neutral-200 bg-neutral-50/20 rounded-xl space-y-4 relative group/item">
                  <button
                    onClick={() => handleRemoveExperience(idx)}
                    className="absolute top-4 right-4 p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Role / Position</label>
                      <input 
                        type="text" 
                        value={exp.role || ''} 
                        onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Company / Agency</label>
                      <input 
                        type="text" 
                        value={exp.company || ''} 
                        onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Period / Dates</label>
                      <input 
                        type="text" 
                        value={exp.period || ''} 
                        onChange={(e) => handleUpdateExperience(idx, 'period', e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs font-mono"
                        placeholder="e.g. 2024 - Present"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Achievement Description / Projects Managed</label>
                      <textarea 
                        rows={2}
                        value={exp.description || ''} 
                        onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Fun Facts & Hobbies CMS */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-150 pb-4 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="text-neutral-400" size={16} />
                <h2 className="font-serif text-lg font-normal text-neutral-800">Fun Facts, Interests & Social Integrations ({editableProfile.funFacts?.length || 0})</h2>
              </div>
              <button 
                onClick={handleAddFunFact}
                className="px-3 py-1.5 bg-black text-white rounded-lg text-xs hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={12} /> Add Fun Fact
              </button>
            </div>

            <div className="space-y-6">
              {editableProfile.funFacts?.map((fact: any, idx: number) => (
                <div key={idx} className="p-5 border border-neutral-200 bg-neutral-50/20 rounded-xl space-y-4 relative group/item">
                  <button
                    onClick={() => handleRemoveFunFact(idx)}
                    className="absolute top-4 right-4 p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                    title="Remove Fact"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Category Title Badge</label>
                      <input 
                        type="text" 
                        value={fact.category || ''} 
                        onChange={(e) => handleUpdateFunFact(idx, 'category', e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs font-mono uppercase"
                        placeholder="e.g. OUTDOORS 🏔️"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Fact Title Header</label>
                      <input 
                        type="text" 
                        value={fact.title || ''} 
                        onChange={(e) => handleUpdateFunFact(idx, 'title', e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Content Context / Story Text</label>
                      <textarea 
                        rows={2}
                        value={fact.value || ''} 
                        onChange={(e) => handleUpdateFunFact(idx, 'value', e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Profile Button */}
          <div className="flex justify-end pt-4" id="cms-profile-save-bar">
            <button
              onClick={handleSaveProfile}
              disabled={saveProfileLoading}
              className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saveProfileLoading ? (
                <>
                  <Loader2 className="animate-spin text-emerald-200" size={16} />
                  <span>Saving to database...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save All Profile Details</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 2: GRAPHICS PROJECTS LIST CMS --- */}
      {activeTab === 'projects' && (
        <div className="space-y-6" id="cms-projects-editor">
          {projectsError && (
            <div className="bg-red-50 border border-red-150 text-red-700 p-4 rounded-xl text-xs font-sans">
              ⚠️ {projectsError}
            </div>
          )}

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4 mb-6 gap-4">
              <div>
                <h2 className="font-serif text-lg font-normal text-neutral-800">Dynamic Graphics Projects Catalog</h2>
                <p className="text-[10px] text-neutral-400 font-sans mt-1">Add, update, or remove projects shown inside the primary Graphics Portfolio view.</p>
              </div>

              <button
                onClick={() => handleOpenProjectModal()}
                className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-medium rounded-xl text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>Add Graphics Project</span>
              </button>
            </div>

            {projectsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-neutral-500" size={24} />
                <p className="text-xs text-neutral-400 font-mono">Synchronising with portfolio database...</p>
              </div>
            ) : projectsList.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/40">
                <ImageIcon className="mx-auto text-neutral-300 mb-3" size={32} />
                <h3 className="font-serif text-base text-neutral-700">No Projects Found</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">Click the Add button to create your first graphic design, packaging, or branding showcase project.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-neutral-150">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-400 font-mono uppercase text-[9px] tracking-wider border-b border-neutral-150">
                      <th className="p-4 w-20">Preview</th>
                      <th className="p-4">Project Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {projectsList.map((project) => (
                      <tr key={project.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="p-4">
                          <div className="w-12 h-12 rounded-lg border border-neutral-200 bg-white overflow-hidden flex items-center justify-center">
                            {project.thumbnail ? (
                              <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={14} className="text-neutral-300" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-neutral-800">{project.title}</div>
                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">slug: {project.slug}</div>
                        </td>
                        <td className="p-4 text-neutral-500">
                          {project.category}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono ${
                            project.status === 'Published' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-neutral-100 text-neutral-600 border border-neutral-250'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {project.featured ? (
                            <span className="text-amber-500 font-mono" title="Featured Project">★ Yes</span>
                          ) : (
                            <span className="text-neutral-300 font-mono">- No</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenProjectModal(project)}
                            className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ADD/EDIT PROJECT OVERLAY MODAL --- */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" id="project-cms-modal">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-150 flex items-center justify-between">
              <h3 className="font-serif text-xl font-normal text-neutral-900">
                {editingProject.id ? 'Edit Graphics Project' : 'Create New Graphics Project'}
              </h3>
              <button 
                onClick={handleCloseProjectModal}
                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 space-y-6 flex-grow overflow-y-auto">
              {projectFormError && (
                <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-xs rounded-xl font-sans">
                  ⚠️ {projectFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Project Title</label>
                  <input 
                    type="text" 
                    value={editingProject.title || ''} 
                    onChange={(e) => handleProjectFieldChange('title', e.target.value)}
                    placeholder="e.g. Minimalist Packaging"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:bg-white focus:border-neutral-900 outline-none"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">URL Slug</label>
                  <input 
                    type="text" 
                    value={editingProject.slug || ''} 
                    onChange={(e) => handleProjectFieldChange('slug', e.target.value)}
                    placeholder="e.g. minimalist-packaging"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:bg-white focus:border-neutral-900 outline-none"
                  />
                </div>

                {/* Category select */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Category</label>
                  <select
                    value={editingProject.category || 'Graphic Design'}
                    onChange={(e) => handleProjectFieldChange('category', e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs outline-none"
                  >
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Branding">Branding</option>
                    <option value="Packaging Design">Packaging Design</option>
                    <option value="Web Design">Web Design</option>
                  </select>
                </div>

                {/* Status select */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Status</label>
                  <select
                    value={editingProject.status || 'Draft'}
                    onChange={(e) => handleProjectFieldChange('status', e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs outline-none"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                {/* Short Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Short Summary Description</label>
                  <input 
                    type="text" 
                    value={editingProject.short_description || ''} 
                    onChange={(e) => handleProjectFieldChange('short_description', e.target.value)}
                    placeholder="One-sentence highlight of the design concept..."
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:bg-white focus:border-neutral-900 outline-none"
                  />
                </div>

                {/* Full Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Detailed Project Case Study</label>
                  <textarea 
                    rows={4}
                    value={editingProject.description || ''} 
                    onChange={(e) => handleProjectFieldChange('description', e.target.value)}
                    placeholder="Explain layout grids, typography palettes, materials used, visual aesthetics, or developmental processes..."
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:bg-white focus:border-neutral-900 outline-none resize-none"
                  />
                </div>

                {/* Client & Date */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Client Name (Optional)</label>
                  <input 
                    type="text" 
                    value={editingProject.client || ''} 
                    onChange={(e) => handleProjectFieldChange('client', e.target.value)}
                    placeholder="e.g. Basel Art Gallery"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:bg-white focus:border-neutral-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Completion Date</label>
                  <input 
                    type="month" 
                    value={editingProject.completion_date || ''} 
                    onChange={(e) => handleProjectFieldChange('completion_date', e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono outline-none"
                  />
                </div>

                {/* External Link & Featured */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Project Live / Behance Link (Optional)</label>
                  <input 
                    type="text" 
                    value={editingProject.project_url || ''} 
                    onChange={(e) => handleProjectFieldChange('project_url', e.target.value)}
                    placeholder="https://behance.net/..."
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:bg-white focus:border-neutral-900 outline-none"
                  />
                </div>

                <div className="flex items-center h-full pt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
                    <input 
                      type="checkbox" 
                      checked={!!editingProject.featured} 
                      onChange={(e) => handleProjectFieldChange('featured', e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                    />
                    <span>Feature this project in the primary list (Hero)</span>
                  </label>
                </div>

                {/* Tags input */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Tags (comma-separated)</label>
                  <input 
                    type="text" 
                    value={editingProject.tags?.join(', ') || ''} 
                    onChange={(e) => handleProjectFieldChange('tags', e.target.value.split(',').map(t => t.trim()))}
                    placeholder="Typography, Grid, Print"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:bg-white focus:border-neutral-900 outline-none"
                  />
                </div>

                {/* Software Used */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Software Used (comma-separated)</label>
                  <input 
                    type="text" 
                    value={editingProject.software_used?.join(', ') || ''} 
                    onChange={(e) => handleProjectFieldChange('software_used', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="Adobe Illustrator, Photoshop"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:bg-white focus:border-neutral-900 outline-none"
                  />
                </div>
              </div>

              {/* Thumbnail Image Section */}
              <div className="p-4 border border-dashed border-neutral-250 bg-neutral-50/40 rounded-xl space-y-3">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400">Core Thumbnail Image</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 rounded-lg border border-neutral-200 overflow-hidden bg-white shrink-0">
                    {editingProject.thumbnail ? (
                      <img src={editingProject.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-300">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="px-3.5 py-2 bg-white border border-neutral-200 text-neutral-800 rounded-xl text-xs font-medium cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition-colors inline-block">
                      Select Thumbnail File
                      <input type="file" accept="image/*" onChange={handleProjectThumbnailUpload} className="hidden" />
                    </label>
                    <p className="text-[10px] text-neutral-400 mt-1.5">Select a landscape graphic preview image.</p>
                  </div>
                </div>
              </div>

              {/* Gallery List and Upload */}
              <div className="p-4 border border-dashed border-neutral-250 bg-neutral-50/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400">Project Showcase Gallery ({editingProject.gallery?.length || 0})</label>
                  <label className="px-3 py-1.5 bg-white border border-neutral-200 hover:border-neutral-400 text-neutral-800 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                    Add Showcase Images
                    <input type="file" accept="image/*" multiple onChange={handleProjectGalleryUpload} className="hidden" />
                  </label>
                </div>

                {editingProject.gallery && editingProject.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {editingProject.gallery.map((img, index) => (
                      <div key={index} className="relative group w-full h-20 rounded-lg border border-neutral-200 overflow-hidden bg-white">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-md transition-colors"
                          title="Remove Showcase Image"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-neutral-400 py-4 text-center">Add case study slides, closeups, mockups, or extra visual layouts.</p>
                )}
              </div>
            </div>

            {/* Modal Controls Footer */}
            <div className="px-6 py-4 border-t border-neutral-150 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseProjectModal}
                className="px-4 py-2 border border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={saveProjectLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saveProjectLoading ? (
                  <>
                    <Loader2 className="animate-spin text-emerald-200" size={12} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={12} />
                    <span>Save Project</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

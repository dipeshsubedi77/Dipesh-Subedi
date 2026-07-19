import { Project, profileData } from "../data/profile";

const LOCAL_STORAGE_KEY = "dipesh_portfolio_projects";

export function getProjects(): Project[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading projects from localStorage:", e);
  }
  // Fallback to static profileData projects
  return profileData.projects;
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Error saving projects to localStorage:", e);
  }
}

export function addProject(project: Project): Project[] {
  const current = getProjects();
  const updated = [project, ...current];
  saveProjects(updated);
  return updated;
}

export function updateProject(index: number, updatedProject: Project): Project[] {
  const current = getProjects();
  if (index >= 0 && index < current.length) {
    current[index] = updatedProject;
    saveProjects(current);
  }
  return current;
}

export function deleteProject(index: number): Project[] {
  const current = getProjects();
  if (index >= 0 && index < current.length) {
    current.splice(index, 1);
    saveProjects(current);
  }
  return current;
}

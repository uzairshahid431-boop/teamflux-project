const BASE_URL = "/api";

export type ProjectStatus = 'active' | 'inactive' | 'completed';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  team_id: number;
}

export interface ProjectCreateData {
  name: string;
  description: string;
  status: ProjectStatus;
  team_id: number;
}

export const fetchProjects = async (token: string, teamId?: number): Promise<Project[]> => {
  const url = teamId 
    ? `${BASE_URL}/projects/?team_id=${teamId}`
    : `${BASE_URL}/projects/`;
    
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch projects.");
  }

  return response.json();
};

export const createProject = async (data: ProjectCreateData, token: string): Promise<Project> => {
  const response = await fetch(`${BASE_URL}/projects/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to create project.");
  }

  return response.json();
};

export const updateProject = async (id: number, data: Partial<ProjectCreateData>, token: string): Promise<Project> => {
  const response = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to update project.");
  }

  return response.json();
};

export const deleteProject = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete project.");
  }
};

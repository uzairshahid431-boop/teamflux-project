import axios from "axios";

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
    
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to fetch projects.");
  }
};

export const createProject = async (data: ProjectCreateData, token: string): Promise<Project> => {
  try {
    const response = await axios.post(`${BASE_URL}/projects/`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Failed to create project.");
  }
};

export const updateProject = async (id: number, data: Partial<ProjectCreateData>, token: string): Promise<Project> => {
  try {
    const response = await axios.put(`${BASE_URL}/projects/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Failed to update project.");
  }
};

export const deleteProject = async (id: number, token: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error: any) {
    throw new Error("Failed to delete project.");
  }
};

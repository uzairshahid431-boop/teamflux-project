import axios from "axios";

const BASE_URL = "/api";

export interface UserInTeam {
  id: number;
  name: string;
  role: string;
}

export interface Team {
  id: number;
  name: string;
  lead_id: number;
  lead?: UserInTeam;
  members: UserInTeam[];
}

export const fetchTeams = async (token: string): Promise<Team[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/teams/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to fetch teams.");
  }
};

export const createTeam = async (name: string, lead_id: number, token: string): Promise<Team> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/teams/`,
      { name, lead_id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Failed to create team.");
  }
};

export const updateTeam = async (id: number, name: string, lead_id: number, token: string): Promise<Team> => {
  try {
    const response = await axios.put(
      `${BASE_URL}/teams/${id}`,
      { name, lead_id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Failed to update team.");
  }
};

export const deleteTeam = async (id: number, token: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/teams/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error: any) {
    throw new Error("Failed to delete team.");
  }
};

export const addTeamMember = async (teamId: number, userId: number, token: string): Promise<void> => {
  try {
    await axios.post(
      `${BASE_URL}/teams/${teamId}/members`,
      { user_id: userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Failed to add member.");
  }
};

export const removeTeamMember = async (teamId: number, userId: number, token: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/teams/${teamId}/remove-member`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { user_id: userId },
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Failed to remove member.");
  }
};

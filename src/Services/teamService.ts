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
  const response = await fetch(`${BASE_URL}/teams/`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch teams.");
  }

  return response.json();
};

export const createTeam = async (name: string, lead_id: number, token: string): Promise<Team> => {
  const response = await fetch(`${BASE_URL}/teams/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name, lead_id }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to create team.");
  }

  return response.json();
};

export const updateTeam = async (id: number, name: string, lead_id: number, token: string): Promise<Team> => {
  const response = await fetch(`${BASE_URL}/teams/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name, lead_id }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to update team.");
  }

  return response.json();
};

export const deleteTeam = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/teams/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete team.");
  }
};

export const addTeamMember = async (teamId: number, userId: number, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/teams/${teamId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to add member.");
  }
};

export const removeTeamMember = async (teamId: number, userId: number, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/teams/${teamId}/remove-member`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to remove member.");
  }
};

const BASE_URL = "/api";

export type SessionStatus = 'planned' | 'completed' | 'cancelled';
export type ActionItemStatus = 'pending' | 'in_progress' | 'completed';

export interface SessionNote {
  id: number;
  content: string;
  session_id: number;
  user_id: number;
  created_at: string;
  author_name?: string;
}

export interface ActionItem {
  id: number;
  title: string;
  completed: boolean;
  status: ActionItemStatus;
  session_id: number;
  assignee_id?: number;
  due_date?: string;
  created_at: string;
  user_id: number;
}

export interface GrowthSession {
  id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  team_id: number;
  location?: string;
  meeting_link?: string;
  duration?: number;
  presenter_id?: number;
  calendar_event_id?: string;
  notes?: SessionNote[];
  action_items?: ActionItem[];
}

export interface GrowthSessionCreate {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  team_id: number;
  location?: string;
  meeting_link?: string;
  duration?: number;
  presenter_id?: number;
}

export const fetchSessions = async (token: string, filters: { team_id?: number; status?: string } = {}): Promise<GrowthSession[]> => {
  const queryParams = new URLSearchParams();
  if (filters.team_id) queryParams.append('team_id', filters.team_id.toString());
  if (filters.status) queryParams.append('status', filters.status);
  
  const response = await fetch(`${BASE_URL}/growth-sessions/?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch sessions.");
  }

  return response.json();
};

export const createSession = async (data: GrowthSessionCreate, token: string): Promise<GrowthSession> => {
  const response = await fetch(`${BASE_URL}/growth-sessions/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to create session.");
  }

  return response.json();
};

export const updateSession = async (id: number, data: Partial<GrowthSessionCreate>, token: string): Promise<GrowthSession> => {
  const response = await fetch(`${BASE_URL}/growth-sessions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to update session.");
  }

  return response.json();
};

export const updateSessionStatus = async (id: number, status: SessionStatus, token: string): Promise<GrowthSession> => {
  const response = await fetch(`${BASE_URL}/growth-sessions/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to update status.");
  }

  return response.json();
};

export const deleteSession = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/growth-sessions/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete session.");
  }
};

export const exportIcs = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/growth-sessions/${id}/calendar-export`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to export calendar.");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-${id}.ics`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Notes operations
export const createNote = async (sessionId: number, content: string, token: string): Promise<SessionNote> => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionId}/notes/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error("Failed to create note.");
  }
  return response.json();
};

export const updateNote = async (sessionId: number, noteId: number, content: string, token: string): Promise<SessionNote> => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionId}/notes/${noteId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error("Failed to update note.");
  }
  return response.json();
};

export const deleteNote = async (sessionId: number, noteId: number, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionId}/notes/${noteId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete note.");
  }
};

// Action Items operations
export const createActionItem = async (sessionId: number, data: { title: string; status?: ActionItemStatus; assignee_id?: number; due_date?: string }, token: string): Promise<ActionItem> => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionId}/action-items/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ ...data, titlr: data.title }), // Backend schema uses 'titlr' for some reason in ActionItemBase?
  });

  if (!response.ok) {
    throw new Error("Failed to create action item.");
  }
  return response.json();
};

export const updateActionItem = async (sessionId: number, itemId: number, data: Partial<ActionItem>, token: string): Promise<ActionItem> => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionId}/action-items/${itemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update action item.");
  }
  return response.json();
};

export const deleteActionItem = async (sessionId: number, itemId: number, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionId}/action-items/${itemId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete action item.");
  }
};

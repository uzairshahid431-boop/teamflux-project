import axios from "axios";
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
  
  try {
    const response = await axios.get(`${BASE_URL}/growth-sessions/?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to fetch sessions.");
  }
};

export const createSession = async (data: GrowthSessionCreate, token: string): Promise<GrowthSession> => {
  try {
    const response = await axios.post(`${BASE_URL}/growth-sessions/`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Failed to create session.");
  }
};

export const updateSession = async (id: number, data: Partial<GrowthSessionCreate>, token: string): Promise<GrowthSession> => {
  try {
    const response = await axios.put(`${BASE_URL}/growth-sessions/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Failed to update session.");
  }
};

export const updateSessionStatus = async (id: number, status: SessionStatus, token: string): Promise<GrowthSession> => {
  try {
    const response = await axios.patch(`${BASE_URL}/growth-sessions/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Failed to update status.");
  }
};

export const deleteSession = async (id: number, token: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/growth-sessions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error: any) {
    throw new Error("Failed to delete session.");
  }
};

export const exportIcs = async (id: number, token: string): Promise<void> => {
  try {
    const response = await axios.get(`${BASE_URL}/growth-sessions/${id}/calendar-export`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${id}.ics`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error: any) {
    throw new Error("Failed to export calendar.");
  }
};

export const fetchNotes = async (sessionId: number, token: string): Promise<SessionNote[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/sessions/${sessionId}/notes/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to fetch notes.");
  }
};

export const createNote = async (sessionId: number, content: string, token: string): Promise<SessionNote> => {
  try {
    const response = await axios.post(`${BASE_URL}/sessions/${sessionId}/notes/`, { content }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to create note.");
  }
};

export const updateNote = async (sessionId: number, noteId: number, content: string, token: string): Promise<SessionNote> => {
  try {
    const response = await axios.patch(`${BASE_URL}/sessions/${sessionId}/notes/${noteId}`, { content }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to update note.");
  }
};

export const deleteNote = async (sessionId: number, noteId: number, token: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/sessions/${sessionId}/notes/${noteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error: any) {
    throw new Error("Failed to delete note.");
  }
};

// Action Items operations
export const fetchActionItems = async (sessionId: number, token: string): Promise<ActionItem[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/sessions/${sessionId}/action-items/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to fetch action items.");
  }
};

export const createActionItem = async (sessionId: number, data: { title: string; status?: ActionItemStatus; assignee_id?: number; due_date?: string }, token: string): Promise<ActionItem> => {
  try {
    const response = await axios.post(`${BASE_URL}/sessions/${sessionId}/action-items/`, { ...data, titlr: data.title }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to create action item.");
  }
};

export const updateActionItem = async (sessionId: number, itemId: number, data: Partial<ActionItem>, token: string): Promise<ActionItem> => {
  try {
    const response = await axios.patch(`${BASE_URL}/sessions/${sessionId}/action-items/${itemId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to update action item.");
  }
};

export const deleteActionItem = async (sessionId: number, itemId: number, token: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/sessions/${sessionId}/action-items/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error: any) {
    throw new Error("Failed to delete action item.");
  }
};

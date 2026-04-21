import axios from "axios";
import { BASE_URL } from '../utils/api';

export type DebtPriority = 'low' | 'medium' | 'high' | 'critical';
export type DebtStatus = 'open' | 'in_progress' | 'resolved' | 'identified' | 'wont_fix';

export interface DebtComment {
  id: number;
  user_id: number;
  comment: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface TechnicalDebt {
  id: number;
  project_id: number;
  owner_id: number;
  title: string;
  description: string;
  priority: DebtPriority;
  status: DebtStatus;
  severity?: number;
  estimated_effort?: number;
  actual_effort?: number;
  due_date?: string;
  created_at: string;
  comments?: DebtComment[];
  project?: {
    id: number;
    name: string;
  };
  owner?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface DebtFilters {
  project_id?: number | string;
  priority?: string;
  status?: string;
  search?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
}

export const fetchTechnicalDebts = async (token: string, filters: DebtFilters = {}): Promise<TechnicalDebt[]> => {
  const params = new URLSearchParams();
  if (filters.project_id && filters.project_id !== 'all') params.append('project_id', filters.project_id.toString());
  if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.order) params.append('order', filters.order);
  
  // Note: Pagination skip/limit on backend seems to have its own endpoint or might not be fully integrated with filters
  // But we'll try to use them as params if the backend supports it eventually.
  // For now, the backend GET /technical-debts/ returns all filtered results.
  
  try {
    const response = await axios.get(`${BASE_URL}/technical-debts/?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch technical debts');
  }
};

export const fetchTechnicalDebtsPaginated = async (token: string, skip: number = 0, limit: number = 10): Promise<TechnicalDebt[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/technical-debts/technical-debt?skip=${skip}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch paginated technical debts');
  }
};

export const createTechnicalDebt = async (data: any, token: string): Promise<TechnicalDebt> => {
  try {
    const response = await axios.post(`${BASE_URL}/technical-debts/`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to create technical debt');
  }
};

export const updateTechnicalDebt = async (id: number, data: any, token: string): Promise<TechnicalDebt> => {
  try {
    const response = await axios.put(`${BASE_URL}/technical-debts/${id}`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to update technical debt');
  }
};

export const deleteTechnicalDebt = async (id: number, token: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/technical-debts/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to delete technical debt');
  }
};

export const updateDebtStatus = async (id: number, status: DebtStatus, token: string): Promise<any> => {
  try {
    const response = await axios.patch(`${BASE_URL}/technical-debts/${id}/status`, { status }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to update debt status');
  }
};

export const updateDebtPriority = async (id: number, priority: DebtPriority, token: string): Promise<any> => {
  try {
    const response = await axios.patch(`${BASE_URL}/technical-debts/${id}/priority`, { priority }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to update debt priority');
  }
};

export const assignDebtOwner = async (id: number, owner_id: number, token: string): Promise<any> => {
  try {
    const response = await axios.patch(`${BASE_URL}/technical-debts/${id}/assign`, { owner_id }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to assign debt owner');
  }
};

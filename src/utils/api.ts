import axios from "axios";

export const BASE_URL = "/api";

export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}


export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const formData = new FormData();
  formData.append("username", email); // FastAPI OAuth2 uses 'username' field for login
  formData.append("password", password);

  try {
    const response = await axios.post(`${BASE_URL}/login`, formData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Authentication failed. Invalid email or password.");
  }
};

export const registerUser = async (name: string, email: string, password: string): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`${BASE_URL}/user_register`, { name, email, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Registration failed. Email might already be taken.");
  }
};


export const fetchUserProfile = async (token: string): Promise<User> => {
  try {
    const response = await axios.get(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to fetch user profile. Session might be expired.");
  }
};

export const fetchAllUsers = async (token: string): Promise<User[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to fetch users.");
  }
};

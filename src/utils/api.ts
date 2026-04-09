const BASE_URL = "/api";

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

  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    body: formData,
    // Note: Do NOT set Content-Type header when using FormData; fetch handles it with boundary.
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Authentication failed. Invalid email or password.");
  }

  return response.json();
};
export const registerUser = async (name: string, email: string, password: string): Promise<{ message: string }> => {
  const response = await fetch(`${BASE_URL}/user_register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Registration failed. Email might already be taken.");
  }

  return response.json();
};


export const fetchUserProfile = async (token: string): Promise<User> => {
  const response = await fetch(`${BASE_URL}/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile. Session might be expired.");
  }

  return response.json();
};

export const fetchAllUsers = async (token: string): Promise<User[]> => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users.");
  }

  return response.json();
};

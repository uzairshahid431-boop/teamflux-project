import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../utils/api";
import { fetchUserProfile } from "../utils/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Persistence logic (localStorage)
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("auth_token");

      if (savedToken) {
        try {
          // Fetch user profile to verify token and get user details
          const userData = await fetchUserProfile(savedToken);
          setToken(savedToken);
          setUser(userData);
        } catch (error) {
          console.error("Failed to restore session", error);
          // Clear invalid token
          localStorage.removeItem("auth_token");
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);
  
  const login = async (authToken: string) => {
    try {
      const userData = await fetchUserProfile(authToken);
      setToken(authToken);
      setUser(userData);
      localStorage.setItem("auth_token", authToken);
    } catch (error) {
      console.error("Login initialization failed", error);
      throw new Error("Failed to complete login. Please try again.");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

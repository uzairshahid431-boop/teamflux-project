import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../utils/api";
import { fetchUserProfile } from "../utils/api";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../store/hooks";
import { setCredentials, logout as reduxLogout } from "../store/authSlice";

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
  const dispatch = useDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  // Persistence logic (localStorage) - Now handles initial hydration and verification
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("auth_token");

      if (savedToken && !user) {
        try {
          const userData = await fetchUserProfile(savedToken);
          dispatch(setCredentials({ user: userData, token: savedToken }));
        } catch (error) {
          console.error("Failed to restore session", error);
          dispatch(reduxLogout());
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [dispatch, user]);

  const login = async (authToken: string) => {
    try {
      const userData = await fetchUserProfile(authToken);
      dispatch(setCredentials({ user: userData, token: authToken }));
    } catch (error) {
      console.error("Login initialization failed", error);
      throw new Error("Failed to complete login. Please try again.");
    }
  };

  const logout = () => {
    dispatch(reduxLogout());
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

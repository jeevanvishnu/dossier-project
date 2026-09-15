"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, setAccessToken, getAccessToken, handleApiError } from "../lib/axios";
import toast from "react-hot-toast";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessTokenState, setAccessTokenState] = useState<string | null>(getAccessToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const updateToken = (token: string | null) => {
    setAccessToken(token);
    setAccessTokenState(token);
  };

  // Fetch logged in user profile
  const fetchMe = useCallback(async (): Promise<User | null> => {
    try {
      const response = await api.get("/auth/me");
      if (response.data?.success && response.data?.data?.user) {
        setUser(response.data.data.user);
        return response.data.data.user;
      }
    } catch {
      // Not authenticated or token expired
    }
    return null;
  }, []);

  // Restore session on application load
  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Attempt /auth/me with existing access token or cookie
      // (The Axios interceptor will automatically attempt a refresh if 401 occurs)
      const currentUser = await fetchMe();
      if (!currentUser) {
        setUser(null);
        updateToken(null);
      }
    } catch {
      setUser(null);
      updateToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMe]);

  useEffect(() => {
    restoreSession();

    // Event listener for global 401 logout
    const handleUnauthorized = () => {
      setUser(null);
      updateToken(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [restoreSession]);

  // Sign In action
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/signin", { email, password });
      if (response.data?.success) {
        const { user: userData, accessToken } = response.data.data;
        updateToken(accessToken);
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}!`);
        return true;
      }
    } catch (err: unknown) {
      handleApiError(err, "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  // Logout action
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await api.post("/auth/logout").catch(() => null);
    } finally {
      updateToken(null);
      setUser(null);
      setIsLoading(false);
      toast.success("Logged out successfully.");
    }
  };

  const refreshUser = async (): Promise<void> => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: accessTokenState,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

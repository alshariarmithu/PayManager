"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type User = {
  id?: number;
  name: string;
  email: string;
  role?: string;
};

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadFromCache = useCallback(() => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        return true;
      }
    } catch (err) {
      console.error("Failed to load auth cache:", err);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return false;
  }, []);

  useEffect(() => {
    const hasCache = loadFromCache();
    if (!hasCache) {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  }, [loadFromCache]);

  const login = useCallback(
    (userData: User, token: string, remember: boolean = false) => {
      try {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
        setError(null);

        router.push("/dashboard");
      } catch (err) {
        console.error("Login error:", err);
        setError("Login failed, please try again.");
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsAuthenticated(false);
    setUser(null);

    router.push("/login");
  }, [router]);

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout,
  };
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { currentUser } from "@/lib/mock-data";

interface AuthContextType {
  isAuthenticated: boolean;
  user: typeof currentUser | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<typeof currentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authStatus = localStorage.getItem("ecosphere_auth");
    const authUser = localStorage.getItem("ecosphere_user");
    
    if (authStatus === "true" && authUser) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(authUser));
      } catch (e) {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("ecosphere_auth");
        localStorage.removeItem("ecosphere_user");
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    
    const isAuthPage = pathname === "/login" || pathname === "/register";
    
    if (!isAuthenticated && !isAuthPage) {
      router.push("/login");
    } else if (isAuthenticated && isAuthPage) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, pathname, isLoading, router]);

  const API_BASE_URL = "http://localhost:4000/api";

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Server Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      localStorage.setItem("ecosphere_auth", "true");
      localStorage.setItem("ecosphere_user", JSON.stringify(data.user));
      setIsAuthenticated(true);
      setUser(data.user);
    } catch (error) {
      console.error("Backend auth failed:", error);
      throw error;
    }
  };

  const registerUser = async (name: string, email: string, pass: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pass }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Registration failed");
      }

      const data = await res.json();
      localStorage.setItem("ecosphere_auth", "true");
      localStorage.setItem("ecosphere_user", JSON.stringify(data.user));
      setIsAuthenticated(true);
      setUser(data.user);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("ecosphere_auth");
    localStorage.removeItem("ecosphere_user");
    setIsAuthenticated(false);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register: registerUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

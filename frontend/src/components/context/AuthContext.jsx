"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { apiUrl } from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const response = await fetch(apiUrl("/auth/me"), {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) {
          setUser(null);
          return;
        }
        const data = await response.json();
        setUser(data.user || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (email, password) => {
    const response = await fetch(apiUrl("/auth/login"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed.");
    }

    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await fetch(apiUrl("/auth/logout"), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
    setUser(null);
  };

  const signup = async (email, password, name) => {
    const response = await fetch(apiUrl("/auth/signup"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Signup failed.");
    }

    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

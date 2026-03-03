"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { apiUrl } from "@/lib/api";

const AuthContext = createContext();
const ADMIN_ROLES = new Set(["super_admin", "admin", "sub_admin"]);
const PERMISSION_KEYS = [
  "dashboard",
  "product_add",
  "product_edit",
  "product_delete",
  "manage_users",
  "manage_admins",
  "orders",
];

function normalizeUser(user) {
  if (!user) return null;
  const permissions = user.permissions && typeof user.permissions === "object"
    ? user.permissions
    : {};
  const normalizedPermissions = {};
  for (const key of PERMISSION_KEYS) {
    normalizedPermissions[key] = Boolean(permissions[key]);
  }

  return {
    ...user,
    role: String(user.role || "user").toLowerCase(),
    permissions: normalizedPermissions,
  };
}

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
        setUser(normalizeUser(data.user));
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

    const normalized = normalizeUser(data.user);
    setUser(normalized);
    return normalized;
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

    const normalized = normalizeUser(data.user);
    setUser(normalized);
    return normalized;
  };

  const role = user?.role || "user";
  const isAdmin = ADMIN_ROLES.has(role);
  const isSuperAdmin = role === "super_admin";
  const permissions = user?.permissions || {
    dashboard: false,
    product_add: false,
    product_edit: false,
    product_delete: false,
    manage_users: false,
    manage_admins: false,
    orders: false,
  };
  const canAccess = (key) => {
    if (isSuperAdmin) return true;
    return Boolean(permissions[key]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        isAdmin,
        isSuperAdmin,
        canAccess,
        loading,
        login,
        logout,
        signup,
      }}
    >
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

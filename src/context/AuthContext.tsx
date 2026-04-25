"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "vendor" | "user";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  vendorSlug?: string; // if they're a vendor, link to their profile
  favourites: string[]; // array of vendor slugs
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; password: string; name: string; role: UserRole; vendorSlug?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  toggleFavourite: (slug: string) => void;
  isFavourite: (slug: string) => boolean;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
  toggleFavourite: () => {},
  isFavourite: () => false,
  updateUser: () => {},
});

// Admin accounts
const ADMIN_EMAILS = ["jake@thebarpeople.co.uk", "hello@vishalmayo.com"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const stored = localStorage.getItem("anyvendor_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  function saveUser(u: AuthUser | null) {
    setUser(u);
    if (u) {
      localStorage.setItem("anyvendor_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("anyvendor_user");
    }
  }

  async function login(email: string, password: string) {
    // Check stored users
    const users = JSON.parse(localStorage.getItem("anyvendor_users") || "[]");
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      return { success: false, error: "No account found with that email." };
    }
    if (found.password !== password) {
      return { success: false, error: "Incorrect password." };
    }

    const authUser: AuthUser = {
      id: found.id,
      email: found.email,
      name: found.name,
      role: found.role,
      vendorSlug: found.vendorSlug,
      favourites: found.favourites || [],
    };
    saveUser(authUser);
    return { success: true };
  }

  async function signup(data: { email: string; password: string; name: string; role: UserRole; vendorSlug?: string }) {
    const users = JSON.parse(localStorage.getItem("anyvendor_users") || "[]");

    // Check if email already exists
    if (users.find((u: any) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: "An account with that email already exists." };
    }

    // Determine role — admin if email matches admin list
    const role = ADMIN_EMAILS.includes(data.email.toLowerCase()) ? "admin" : data.role;

    const newUser = {
      id: crypto.randomUUID(),
      email: data.email,
      password: data.password,
      name: data.name,
      role,
      vendorSlug: data.vendorSlug,
      favourites: [],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("anyvendor_users", JSON.stringify(users));

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as UserRole,
      vendorSlug: newUser.vendorSlug,
      favourites: [],
    };
    saveUser(authUser);
    return { success: true };
  }

  function logout() {
    saveUser(null);
  }

  function toggleFavourite(slug: string) {
    if (!user) return;
    const updated = user.favourites.includes(slug)
      ? user.favourites.filter((s) => s !== slug)
      : [...user.favourites, slug];

    const updatedUser = { ...user, favourites: updated };
    saveUser(updatedUser);

    // Also update in the users array
    const users = JSON.parse(localStorage.getItem("anyvendor_users") || "[]");
    const idx = users.findIndex((u: any) => u.id === user.id);
    if (idx >= 0) {
      users[idx].favourites = updated;
      localStorage.setItem("anyvendor_users", JSON.stringify(users));
    }
  }

  function isFavourite(slug: string) {
    return user?.favourites?.includes(slug) || false;
  }

  function updateUser(updates: Partial<AuthUser>) {
    if (!user) return;
    const updated = { ...user, ...updates };
    saveUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, toggleFavourite, isFavourite, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "learn-easy-parent-token";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* noop */
  }
}

function decodeToken(token: string): User | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return { id: decoded.sub, name: "", email: decoded.email };
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    if (decoded.exp && Date.now() >= decoded.exp * 1000) return true;
    return false;
  } catch {
    return true;
  }
}

async function apiPost(url: string, body: unknown) {
  const res = await fetch(`${API_URL}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

async function fetchUserProfile(token: string): Promise<User | null> {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return null;
    const res = await fetch(`${API_URL}/parents/${decoded.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const parent = json.data || json;
    return { id: parent.id, name: parent.name, email: parent.email };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredToken();
    if (stored && !isTokenExpired(stored)) {
      setToken(stored);
      fetchUserProfile(stored).then((profile) => {
        if (profile) setUser(profile);
        setIsLoading(false);
      }).catch(() => {
        setStoredToken(null);
        setIsLoading(false);
      });
    } else {
      if (stored) setStoredToken(null);
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiPost("/auth/login", { email, password, role: "parent" });
      setStoredToken(data.access_token);
      setToken(data.access_token);
      const profile = await fetchUserProfile(data.access_token);
      setUser(profile || data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (formData: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      const data = await apiPost("/auth/signup/parent", formData);
      setStoredToken(data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, signup, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}